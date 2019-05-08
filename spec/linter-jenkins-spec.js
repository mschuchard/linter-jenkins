'use babel';

import * as path from 'path';

describe('The Jenkins provider for Linter', () => {
  const lint = require(path.join(__dirname, '../lib/main.js')).provideLinter().lint;

  beforeEach(() => {
    atom.workspace.destroyActivePaneItem();
    waitsForPromise(() => {
      atom.packages.activatePackage('linter-jenkins');/*
      atom.config.set('linter-jenkins.ssh.port', '2222');
      atom.config.set('linter-jenkins.ssh.key', '/home/matt/git_repos/vagrant-boxes-docker-images/jenkins-vagrant/.vagrant/machines/default/virtualbox/private_key');
      atom.config.set('linter-jenkins.ssh.userHost', 'vagrant@127.0.0.1');
      atom.config.set('linter-jenkins.ssh.httpURI', 'http://192.168.33.10:8080');
      atom.config.set('linter-jenkins.lintMethod', 'SSH then full CLI');*/
      atom.config.set('linter-jenkins.curl.httpURI', 'https://ci.jenkins.io')
      atom.config.set('linter-jenkins.lintMethod', 'CURL');
      return atom.packages.activatePackage('language-groovy').then(() =>
        atom.workspace.open(path.join(__dirname, 'fixtures/clean', 'Jenkinsfile'))
      );
    });
  });

  describe('checks a file with an environment syntax issue', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/bad_env', 'Jenkinsfile');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the messages', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(3);
        })
      );
    });

    it('verifies the messages', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('"bar \'baz\'" is not a valid environment expression. Use "key = value" pairs with valid Java/shell keys.');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+bad_env\/Jenkinsfile$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[5, 4], [5, 5]]);
          expect(messages[1].severity).toBeDefined();
          expect(messages[1].severity).toEqual('error');
          expect(messages[1].excerpt).toBeDefined();
          expect(messages[1].excerpt).toEqual('Expected name=value pairs');
          expect(messages[1].location.file).toBeDefined();
          expect(messages[1].location.file).toMatch(/.+bad_env\/Jenkinsfile$/);
          expect(messages[1].location.position).toBeDefined();
          expect(messages[1].location.position).toEqual([[4, 2], [4, 3]]);
          expect(messages[2].severity).toBeDefined();
          expect(messages[2].severity).toEqual('error');
          expect(messages[2].excerpt).toBeDefined();
          expect(messages[2].excerpt).toEqual('No variables specified for environment');
          expect(messages[2].location.file).toBeDefined();
          expect(messages[2].location.file).toMatch(/.+bad_env\/Jenkinsfile$/);
          expect(messages[2].location.position).toBeDefined();
          expect(messages[2].location.position).toEqual([[4, 2], [4, 3]]);
        });
      });
    });
  });

  describe('checks a file with stages section missing', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/stages_missing', 'Jenkinsfile');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the two messages', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('Missing required section "stages"');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+stages_missing\/Jenkinsfile$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[2, 0], [2, 1]]);
        });
      });
    });
  });

  describe('checks a file with post section inside stages section', () => {
    let editor = null;
    const badFile = path.join(__dirname, 'fixtures/post_in_stages', 'Jenkinsfile');
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace.open(badFile).then(openEditor => {
          editor = openEditor;
        })
      );
    });

    it('finds the message', () => {
      waitsForPromise(() =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(1);
        })
      );
    });

    it('verifies the first message', () => {
      waitsForPromise(() => {
        return lint(editor).then(messages => {
          expect(messages[0].severity).toBeDefined();
          expect(messages[0].severity).toEqual('error');
          expect(messages[0].excerpt).toBeDefined();
          expect(messages[0].excerpt).toEqual('Expected a stage');
          expect(messages[0].location.file).toBeDefined();
          expect(messages[0].location.file).toMatch(/.+post_in_stages\/Jenkinsfile$/);
          expect(messages[0].location.position).toBeDefined();
          expect(messages[0].location.position).toEqual([[10, 4], [10, 5]]);
        });
      });
    });
  });

  it('finds nothing wrong with a valid file', () => {
    waitsForPromise(() => {
      const goodFile = path.join(__dirname, 'fixtures/clean', 'Jenkinsfile');
      return atom.workspace.open(goodFile).then(editor =>
        lint(editor).then(messages => {
          expect(messages.length).toEqual(0);
        })
      );
    });
  });
});
