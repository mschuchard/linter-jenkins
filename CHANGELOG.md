### Next
- Updated `atom-linter` dependency.
- Provide workaround for SSH outputting info/warn to stderr.

### 1.0.3
- `Use Crumb` option for CURL method now functioning correctly.
- Fix issue where total lint output was parsed instead of each line.
- Debug mode for troubleshooting Jenkins server connectivity.

### 1.0.2
- Disable host key checking wtih SSH methods.
- Experimental option to use CLI then SSH without SSH keys. (disabled)
- Experimental `curl` method now functioning.

### 1.0.1
- Capture all errors instead of just first.
- Fix potential issue with linter undefined return.

### 1.0.0
- Initial version ready for wide usage.

### Roadmap
- https://www.npmjs.com/search?q=keywords:curl, https://www.npmjs.com/search?q=keywords:ssh
- Warning: Permanently added '[127.0.0.1]:2222' (ECDSA) to the list of known hosts is caught as exception instead of being ignored; disabling throwonstderr seems to fix this but causes other problems
- figure out travis
