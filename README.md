![Preview](https://raw.githubusercontent.com/mschuchard/linter-jenkins/master/linter_jenkins.png)

### Linter-Jenkins
[![Build Status](https://travis-ci.com/mschuchard/linter-jenkins.svg?branch=master)](https://travis-ci.com/mschuchard/linter-jenkins)

Linter-Jenkins aims to provide functional and robust `declarative-linter` linting functionality within Atom/Pulsar. This will lint your `Jenkinsfile`s using declarative syntax.

### APM (Atom) and PPM (Pulsar) Support

`apm` was discontinued prior to the sunset by the Atom Editor team. `ppm` for Pulsar does not yet support package publishing. Therefore, the installation instructions are now as follows if you want the latest version in Atom, Atom Beta, or Atom Dev:

- Locate the Atom or Pulsar packages directory on your filesystem (normally at `<home>/.{atom,pulsar}/packages`)
- Retrieve the code from this repository either via `git` or the Code-->Download ZIP option in Github.
- Place the directory containing the repository's code in the Atom or Pulsar packages directory.
- Execute `npm install` in the package directory (requires NPM).
- Repeat for any missing or outdated dependencies.

and Pulsar:

- Install the old version of the package as usual with either PPM or the GUI installer in the editor.
- Locate the Atom or Pulsar packages directory on your filesystem (normally at `<home>/.{atom,pulsar}/packages`)
- Replace the `lib/main.js` file in the package directory with the file located in this remote Github repository.

Additionally: this package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented (especially bug fixes). However, active development on this package has ceased.

### Installation
A Jenkins server with the `jenkins-pipeline` plugin installed is required to be accessible. If one is not available in your network, then it is recommended to stand up a portable server instance with Vagrant or Docker as both will work fine with this. The Linter and Language-Jenkinsfile or Language-Groovy Atom packages are also required. Additional requirements depend upon your usage method (see below).

Note that at this current time the package unit tests (outside of CI which will be Atom Beta `1.61.0` for the time being) and acceptance testing are performed with the latest stable version of Pulsar.

### Usage Methods
- **CLI and CURL**: Requires the `jenkins-cli` installed locally. Lints with `jenkins-cli` requesting the Jenkins server to access its own REST API endpoint.
- **CLI and SSH**: Requires the `jenkins-cli` installed locally. Lints with `jenkins-cli` requesting the Jenkins server to ssh into itself to execute the `declarative-linter`.
- **SSH then CLI**: Requires SSH installed locally and with access to the Jenkins server. Lints with `ssh` into the server, and then the server executing the `declarative-linter` implictly with `jenkins-cli`. This method is not recommended with Vagrant or Docker.
- **SSH then full CLI**: Requires SSH installed locally and with access to the Jenkins server. Lints with `ssh` into the server, and then the server explicitly executing the `jenkins-cli` to access its own REST API endpoint. This method is not recommended with Docker. `vagrant ssh-config` will reveal the information needed to use this with Vagrant.
- **CURL**: Requires CURL installed locally and with access to the Jenkins server. Lints with `curl` against the server's REST API endpoint. This is the easiest, but Jenkins discourages it for security reasons (CRSF helps with this and is handled automatically on the client side).

### Debug
When you select `Debug Mode` from the package settings, the raw command used for linting will be output as info to the linter display in Atom. This is helpful for debugging whether your connection to the Jenkins Pipeline plugin is functioning. Note that CLI and SSH methods pipe in the `Jenkinsfile` content to `stdin`, which is represented as `< /path/to/Jenkinsfile` in the debug display. This might not necessarily be accurate for your OS.

### Note
Due to some incompatibility between the Jenkins Pipeline Validator and Atom and/or its packages, a bug was introduced such that if there is a `;` or `:` in the comments of a `Jenkinsfile`, then the linter information will not display. Also, usage of a `;` in the code (even within a String) or `:` within comments will cause false errors. Please refrain from this usage in your `Jenkinsfile` until Atom and/or Jenkins fixes the bug.
