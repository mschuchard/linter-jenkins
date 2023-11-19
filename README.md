![Preview](https://raw.githubusercontent.com/mschuchard/linter-jenkins/master/linter_jenkins.png)

### Linter-Jenkins
Linter-Jenkins aims to provide functional and robust `declarative-linter` linting functionality within Pulsar. This will lint your `Jenkinsfile`s using declarative syntax.

This package is now in maintenance mode. All feature requests and bug reports in the Github repository issue tracker will receive a response, and possibly also be implemented (especially bug fixes). However, active development on this package has ceased.

### Installation
A Jenkins server with the `jenkins-pipeline` plugin installed is required to be accessible. If one is not available in your network, then it is recommended to stand up a portable server instance with Vagrant or Docker as both will work fine with this. The Atom-IDE-UI and Language-Jenkinsfile or Language-Groovy packages are also required. Additional requirements depend upon your usage method (see below).

All testing is performed with the latest stable version of Pulsar. Any version of Atom or any pre-release version of Pulsar is not supported.

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
