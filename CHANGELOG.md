### Next (Roadmap)
- Updates to Linter API usage.

- https://www.npmjs.com/package/request, https://www.npmjs.com/package/ssh2
- circumvent ; and : bug?

### 1.0.7
- Fix auth token concatenation to CURL request.
- Add websocket option for CLI+HTTP method.

### 1.0.6
- Fix `curl` verify SSL.

### 1.0.5
- Add option to disable strict host key checking on SSH methods.
- Add `user:password|token` authentication option for CURL method.
- Add option to disable SSL connection verification.

### 1.0.4
- Updated `atom-linter` dependency.
- Provide workaround for SSH outputting info/warn to stderr.
- CURL option now follows redirects on endpoints.

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
