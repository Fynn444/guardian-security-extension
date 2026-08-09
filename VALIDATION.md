# Validation Report — v1.0.1

- PASS — syntax: background.js
- PASS — syntax: content.js
- PASS — syntax: lib/analyzer.js
- PASS — syntax: lib/defaults.js
- PASS — syntax: blocked.js
- PASS — syntax: popup.js
- PASS — syntax: options.js
- PASS — syntax: tests/analyzer.test.js
- PASS — regression tests
- PASS — manifest version 1.0.1

## Regression test output

```text
PASS - Google phishing search is allowed
PASS - Google security-research search is allowed
PASS - Direct phishing path is blocked
PASS - Direct malicious path is blocked
PASS - Query-only keyword does not trigger blocking
PASS - Actual URL credentials still add risk
PASS - Harmless @ in query is not credential risk

All analyzer regression tests passed.
```
