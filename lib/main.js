'use babel';

export default {
  config: {
    lintMethod: {
      title: 'Method to Lint Jenkinsfile',
      type: 'string',
      description: 'Method for validating the syntax of the Jenkinsfile.',
      default: 'SSH then full CLI',
      enum: [
        'CLI and CURL (not done)',
        'CLI and SSH (not done)',
        'SSH then CLI (not done)',
        'SSH then full CLI',
        'CURL (possibly node incompatible)'
      ],
    },
    sshFullCli: {
      title: 'SSH then Full CLI',
      type: 'object',
      properties: {
        port: {
          title: 'SSH Port',
          type: 'string',
          description: 'Port to use for ssh.',
          default: '22',
        },
        key: {
          title: 'SSH Key',
          type: 'string',
          description: 'Path to key to use for ssh.',
          default: '~/.ssh/id_rsa',
        },
        userHost: {
          title: 'SSH User@Hostname',
          type: 'string',
          description: 'The username at hostname to use for ssh (this could also be an FQDN or IP address; use what resolves for your network).',
          default: 'root@jenkins',
        },
        cliPath: {
          title: 'CLI Path',
          type: 'string',
          description: 'The path to the jenkins-cli on the Jenkins server.',
          default: '/var/cache/jenkins/war/WEB-INF/jenkins-cli.jar',
        },
        httpURI: {
          title: 'HTTP URI',
          type: 'string',
          description: 'The full HTTP URI to the Jenkins server.',
          default: 'http://jenkins:8080/',
        }
      }
    }
  },

  provideLinter() {
    return {
      name: 'Jenkins',
      grammarScopes: ['source.jenkinsfile', 'source.groovy'],
      scope: 'file',
      lintsOnChange: false,
      lint: (activeEditor) => {
        //return [];

        // establish const vars
        const helpers = require('atom-linter');
        const file = activeEditor.getPath();
        const content = activeEditor.getText();

        // bail out if this is not a Jenkinsfile
        if (!(/Jenkinsfile/.exec(file)))
          return [];

        // regexps for matching on output
        const regex = /WorkflowScript: \d+: (.*) @ line (\d+), column (\d+)/;

        return helpers.exec('ssh', ['-p', atom.config.get('linter-jenkins.sshFullCli.port'), '-i', atom.config.get('linter-jenkins.sshFullCli.key'), atom.config.get('linter-jenkins.sshFullCli.userHost'), `sudo java -jar ${atom.config.get('linter-jenkins.sshFullCli.cliPath')} -s ${atom.config.get('linter-jenkins.sshFullCli.httpURI')} declarative-linter`], {stdin: content, ignoreExitCode: true}).then(output => {
          toReturn = [];
          // matchers for output parsing and capturing
          const matches = regex.exec(output);

          // check for errors
          if (matches != null) {
            toReturn.push({
              severity: 'error',
              excerpt: matches[1],
              location: {
                file: file,
                position: [[Number.parseInt(matches[2]) - 1, Number.parseInt(matches[3]) - 1], [Number.parseInt(matches[2]) - 1, Number.parseInt(matches[3])]],
              },
            });
          }
          return toReturn;
        });
      }
    };
  }
};
