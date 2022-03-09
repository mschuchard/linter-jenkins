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
        webSocket: {
          title: 'Use Websocket',
          type: 'boolean',
          description: 'Use websocket as an alternative to -http (Jenkins >= 2.217).',
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
        },
        disableHostCheck: {
          title: 'Disable Strict Host Key Check',
          type: 'boolean',
          description: 'Disable strict host key checking during SSH. Enable only with stderr ignore option also enabled; otherwise this will cause undesired behavior.',
          default: false,
        },
      }
    },
    curl: {
      title: 'CURL Method',
      type: 'object',
      properties: {
        useCrumb: {
          title: 'Use Crumb (CSRF)',
          type: 'boolean',
          description: 'Retrieve a crumb to use with the CURL request (if CSRF enabled on server).',
          default: false,
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
          description: 'The authentication \'user:(token|password)\' for the connection. Necessary only if anonymous read is disabled.',
          default: '',
        },
        verifySsl: {
          title: 'Verify SSL Cert',
          type: 'boolean',
          description: 'Verify the SSL connection to server is secure.',
          default: true,
        },
      }
    },
  },

  deactivate() {
    this.idleCallbacks.forEach((callbackID) => window.cancelIdleCallback(callbackID));
    this.idleCallbacks.clear();
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'Jenkins',
      grammarScopes: ['source.jenkinsfile', 'source.groovy'],
      scope: 'file',
      lintsOnChange: false,
      lint: async (textEditor) => {
        // establish const vars
        const helpers = require('atom-linter');
        const file = textEditor.getPath();
        const content = textEditor.getText();

        // bail out if this is not a Jenkinsfile
        if (!(/Jenkinsfile/.exec(file)))
          return [];

        // initialize vars and ignore stderr if requested
        let opts = { ignoreExitCode: true, throwOnStderr: !(atom.config.get('linter-jenkins.ignoreStderr')) };
        let cmd = '';
        let args = [];

        // ssh methods
        if (/^SSH/.exec(atom.config.get('linter-jenkins.lintMethod'))) {
          cmd = 'ssh';
          opts.stdin = content;

          // check on disabling strict host key checking
          if (atom.config.get('linter-jenkins.disableHostCheck'))
            args = ['-o', 'StrictHostKeyChecking=no', '-o', 'UserKnownHostsFile=/dev/null'];

          // determine ssh arguments
          if (atom.config.get('linter-jenkins.lintMethod') === 'SSH then CLI')
              args.push(...['-p', atom.config.get('linter-jenkins.ssh.port'), '-i', atom.config.get('linter-jenkins.ssh.key'), atom.config.get('linter-jenkins.ssh.userHost'), 'declarative-linter']);
          // ssh then full cli
          else
              args.push(...['-p', atom.config.get('linter-jenkins.ssh.port'), '-i', atom.config.get('linter-jenkins.ssh.key'), atom.config.get('linter-jenkins.ssh.userHost'), `sudo java -jar ${atom.config.get('linter-jenkins.ssh.cliPath')} -s ${atom.config.get('linter-jenkins.ssh.httpURI')} declarative-linter`]);
        }
        // cli methods
        else if (/^CLI/.exec(atom.config.get('linter-jenkins.lintMethod'))) {
          cmd = atom.config.get('linter-jenkins.cli.javaExecutable');
          opts.stdin = content;

          // determine cli arguments
          if (atom.config.get('linter-jenkins.lintMethod') === 'CLI and HTTP') {
            args = ['-jar', atom.config.get('linter-jenkins.cli.cliJar'), '-s', atom.config.get('linter-jenkins.cli.httpURI'), '-auth', atom.config.get('linter-jenkins.cli.authToken')];
            // add using websocket
            if ((atom.config.get('linter-jenkins.cli.webSocket')))
              args.push('-webSocket');
            // add no cert checking if specified
            if (!(atom.config.get('linter-jenkins.cli.cert')))
              args.push('-noCertificateCheck');
          }
          else { // cli and ssh
            args = ['-jar', atom.config.get('linter-jenkins.cli.cliJar'), '-s', atom.config.get('linter-jenkins.cli.httpURI'), '-ssh', '-user', atom.config.get('linter-jenkins.cli.user')];

            // using ssh keys?
            if (atom.config.get('linter-jenkins.cli.noKey'))
              args.push('-noKeyAuth');
            else
              args.push(...['-i', atom.config.get('linter-jenkins.cli.key')]);
          }

          args.push('declarative-linter');
        }
        // curl methods
        else if (/^CURL/.exec(atom.config.get('linter-jenkins.lintMethod'))) {
          cmd = 'curl';

          // check for insecure ssl connection setting
          if (!(atom.config.get('linter-jenkins.curl.verifySsl')))
            args.push('-k');

          // determine curl arguments
          if (atom.config.get('linter-jenkins.curl.useCrumb')) {
            // declare crumb request
            let crumbRequest

            // retrieve crumb for later usage
            if (atom.config.get('linter-jenkins.curl.authToken') === '')
              crumbRequest = helpers.exec(cmd, ['-L', '-s', `${atom.config.get('linter-jenkins.curl.httpURI')}/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)`]);
            else
              crumbRequest = helpers.exec(cmd, ['-L', '-s', '--user', atom.config.get('linter-jenkins.curl.authToken'), `${atom.config.get('linter-jenkins.curl.httpURI')}/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,":",//crumb)`]);

            // process crumb request response
            crumbRequest.then(response => {
              localStorage.setItem('jenkinsCrumb', response);
            });
            const crumb = localStorage.getItem('jenkinsCrumb');

            args.push(...['-L', '-s', '-X', 'POST', '-H', crumb, '-F', `jenkinsfile=${content}`]);
          }
          else
            args.push(...['-L', '-s', '-X', 'POST', '-F', `jenkinsfile=${content}`]);

          // check if auth token configured and utilze if so
          if (atom.config.get('linter-jenkins.curl.authToken') !== '')
            args.push(...['--user', atom.config.get('linter-jenkins.curl.authToken')]);

          args.push(`${atom.config.get('linter-jenkins.curl.httpURI')}/pipeline-model-converter/validate`);
        }
        else {
          atom.notifications.addError(
            'Invalid linting method specified. Please consult the package config settings GUI for the options.',
            { detail: atom.config.get('linter-jenkins.lintMethod') }
          );
        }

        // output raw command for debugging assistance
        if (atom.config.get('linter-jenkins.debug')) {
          const stdin = cmd === 'curl' ? '' : ` < ${file}`;
          return [{ severity: 'info',
                    excerpt: cmd + ' ' + args.join(' ') + stdin,
                    location: {
                      file,
                      position: [[0, 0], [0, 1]]
                    }
                 }];
        }

        // lint
        return helpers.exec(cmd, args, opts).then(output => {
          let toReturn = [];

          output.split(/\r?\n/).forEach((line) => {
            // matcher for output parsing and capturing
            const matches = /WorkflowScript: \d+: (.*) @ line (\d+), column (\d+)/.exec(line);

            // check for errors
            if (matches != null) {
              toReturn.push({
                severity: 'error',
                excerpt: matches[1],
                location: {
                  file,
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
