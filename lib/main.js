'use babel';

export default {
  config: {
    lintMethod: {
      title: 'Method to Lint Jenkinsfile',
      type: 'string',
      description: 'Method for validating the syntax of the Jenkinsfile.',
      default: 'SSH then full CLI',
      enum: [
        'CLI and HTTP',
        'CLI and SSH',
        'SSH then CLI',
        'SSH then full CLI',
        'CURL'
      ],
      order: 1,
    },
    debug: {
      title: 'Debug Mode',
      type: 'boolean',
      description: 'Display command to assist with debugging connectivity.',
      default: false,
      order: 2,
    },
    ignoreStderr: {
      title: 'Ignore stderr Output',
      type: 'boolean',
      description: 'Enable this if utilizing a SSH-related method that is verified working outside of Atom, and SSH is outputting info/warning to stderr.',
      default: false,
      order: 3,
    },
    cli: {
      title: 'CLI Methods',
      type: 'object',
      properties: {
        javaExecutable: {
          title: 'Java Executable Path',
          type: 'string',
          description: 'Path to java executable.',
          default: 'java',
        },
        cliJar: {
          title: 'Jenkins CLI Path',
          type: 'string',
          description: 'Path to jenkins-cli jar file.',
          default: 'jenkins-cli.jar',
        },
        httpURI: {
          title: 'HTTP URI',
          type: 'string',
          description: 'The full HTTP URI to the Jenkins server.',
          default: 'http://jenkins:8080/',
        },
        authToken: {
          title: 'Authentication Password/Token',
          type: 'string',
          description: 'The authentication \'user:(token|password)\' or \'@/path/to/auth\' for the connection (HTTP only).',
          default: 'kohsuke:abc1234ffe4a',
        },
        cert: {
          title: 'Certificate Check',
          type: 'boolean',
          description: 'Check the certificate during the connection (HTTP only).',
          default: false,
        },
        user: {
          title: 'SSH User',
          type: 'string',
          description: 'User to ssh into Jenkins server as (SSH Only).',
          default: 'root',
        },
        noKey: {
          title: 'No Key Authentication',
          type: 'boolean',
          description: 'Ignore SSH keys during CLI authentication (SSH only).',
          default: false,
        },
        key: {
          title: 'SSH Key',
          type: 'string',
          description: 'Path to key to use for ssh (SSH Only).',
          default: '~/.ssh/id_rsa',
        },
      }
    },
    ssh: {
      title: 'SSH Methods',
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
          description: 'The path to the jenkins-cli on the Jenkins server (Full CLI only).',
          default: '/var/cache/jenkins/war/WEB-INF/jenkins-cli.jar',
        },
        httpURI: {
          title: 'HTTP URI',
          type: 'string',
          description: 'The full HTTP URI to the Jenkins server (Full CLI only).',
          default: 'http://jenkins:8080/',
        }
      }
    },
    curl: {
      title: 'CURL Method',
      type: 'object',
      properties: {
        useCrumb: {
          title: 'Use Crumb',
          type: 'boolean',
          description: 'Retrieve a crumb to use with the CURL request.',
          default: false,
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
        // establish const vars
        const helpers = require('atom-linter');
        const file = activeEditor.getPath();
        const content = activeEditor.getText();

        // bail out if this is not a Jenkinsfile
        if (!(/Jenkinsfile/.exec(file)))
          return [];

        // regexp for matching on output
        const regex = /WorkflowScript: \d+: (.*) @ line (\d+), column (\d+)/;

        // initialize opts and ignore stderr if requested
        opts = {ignoreExitCode: true, throwOnStderr: !(atom.config.get('linter-jenkins.ignoreStderr'))}

        // ssh methods
        if (/^SSH/.exec(atom.config.get('linter-jenkins.lintMethod'))) {
          cmd = 'ssh'
          opts.stdin = content;
          //opts.throwOnStdErr = false;

          // determine ssh arguments
          if (atom.config.get('linter-jenkins.lintMethod') == 'SSH then CLI')
            //args = ['-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null', '-p', atom.config.get('linter-jenkins.ssh.port'), '-i', atom.config.get('linter-jenkins.ssh.key'), atom.config.get('linter-jenkins.ssh.userHost'), 'declarative-linter'];
            args = ['-p', atom.config.get('linter-jenkins.ssh.port'), '-i', atom.config.get('linter-jenkins.ssh.key'), atom.config.get('linter-jenkins.ssh.userHost'), 'declarative-linter'];
          else // ssh then full cli
            //args = ['-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null', '-p', atom.config.get('linter-jenkins.ssh.port'), '-i', atom.config.get('linter-jenkins.ssh.key'), atom.config.get('linter-jenkins.ssh.userHost'), `sudo java -jar ${atom.config.get('linter-jenkins.ssh.cliPath')} -s ${atom.config.get('linter-jenkins.ssh.httpURI')} declarative-linter`];
            args = ['-p', atom.config.get('linter-jenkins.ssh.port'), '-i', atom.config.get('linter-jenkins.ssh.key'), atom.config.get('linter-jenkins.ssh.userHost'), `sudo java -jar ${atom.config.get('linter-jenkins.ssh.cliPath')} -s ${atom.config.get('linter-jenkins.ssh.httpURI')} declarative-linter`];
        }
        // cli methods
        else if (/^CLI/.exec(atom.config.get('linter-jenkins.lintMethod'))) {
          cmd = atom.config.get('linter-jenkins.cli.javaExecutable')
          opts.stdin = content;

          // determine cli arguments
          if (atom.config.get('linter-jenkins.lintMethod') == 'CLI and HTTP') {
            args = ['-jar', atom.config.get('linter-jenkins.cli.cliJar'), '-s', atom.config.get('linter-jenkins.cli.httpURI'), '-auth', atom.config.get('linter-jenkins.cli.authToken')];
            // add no cert checking if specified
            if (!(atom.config.get('linter-jenkins.cli.cert')))
              args.push('-noCertificateCheck')
          }
          else { // cli and ssh
            args = ['-jar', atom.config.get('linter-jenkins.cli.cliJar'), '-s', atom.config.get('linter-jenkins.cli.httpURI'), '-ssh', '-user', atom.config.get('linter-jenkins.cli.user')];

            // using ssh keys?
            if (atom.config.get('linter-jenkins.cli.noKey'))
              args.push('-noKeyAuth')
            else
              args = args.concat(['-i', atom.config.get('linter-jenkins.cli.key')])
          }

          args.push('declarative-linter');
        }
        // curl methods
        else if (/^CURL/.exec(atom.config.get('linter-jenkins.lintMethod'))) {
          cmd = 'curl'

          // determine curl arguments
          if (atom.config.get('linter-jenkins.curl.useCrumb')) {
            crumbRequest = helpers.exec(cmd, ['--silent', `${atom.config.get('linter-jenkins.curl.httpURI')}/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)`]);
            crumbRequest.then(response => {
              localStorage.setItem('jenkinsCrumb', response);
            });
            crumb = localStorage.getItem('jenkinsCrumb');
            args = ['--silent', '-X', 'POST', '-H', crumb, '-F', `jenkinsfile=${content}`, `${atom.config.get('linter-jenkins.curl.httpURI')}/pipeline-model-converter/validate`];
          }
          else
            args = ['--silent', '-X', 'POST', '-F', `jenkinsfile=${content}`, `${atom.config.get('linter-jenkins.curl.httpURI')}/pipeline-model-converter/validate`];
        }

        // output raw command for debugging assistance
        if (atom.config.get('linter-jenkins.debug')) {
          stdin = cmd == 'curl' ? '' : ` < ${activeEditor.getPath()}`;
          return [{severity: 'info',
                   excerpt: cmd + ' ' + args.join(' ') + stdin,
                   location: {
                     file: file,
                     position: [[0, 0], [0, 1]]
                   }
                 }];
        }

        // lint
        return helpers.exec(cmd, args, opts).then(output => {
          var toReturn = [];

          output.split(/\r?\n/).forEach(function (line) {
            // matcher for output parsing and capturing
            const matches = regex.exec(line);

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
          });
          return toReturn;
        });
      }
    };
  }
};
