# Validation Report — v1.1.0

- PASS — Manifest V3
- PASS — Version is 1.1.0
- PASS — Syntax: background.js
- PASS — Syntax: content.js
- PASS — Syntax: blocked.js
- PASS — Syntax: popup.js
- PASS — Syntax: options.js
- PASS — Syntax: lib/analyzer.js
- PASS — Syntax: lib/defaults.js
- PASS — Syntax: lib/search-utils.js
- PASS — Syntax: tests/analyzer.test.js
- PASS — Syntax: tests/search-utils.test.js
- PASS — Tests: tests/analyzer.test.js
- PASS — Tests: tests/search-utils.test.js
- PASS — Asset: background.js
- PASS — Asset: content.css
- PASS — Asset: content.js
- PASS — Asset: lib/analyzer.js
- PASS — Asset: lib/search-utils.js
- PASS — Asset: options.html
- PASS — Asset: popup.html

## Analyzer tests

```text
PASS - Google phishing search is allowed
PASS - Direct phishing path is blocked
PASS - Query-only keyword does not trigger blocking
PASS - PayPal lookalike is flagged
PASS - Legitimate PayPal domain is not flagged as a lookalike
PASS - Lookalike detection can be disabled
PASS - Levenshtein helper works
PASS - Lookalike helper identifies protected brand

All analyzer tests passed.
```

## Search utility tests

```text
PASS - Recognizes google.com
PASS - Recognizes regional Google
PASS - Rejects lookalike Google host
PASS - Unwraps Google q redirect
PASS - Unwraps Google url redirect
PASS - Outbound example.com URL recognized
PASS - Google URL excluded from outbound URLs

All search-utils tests passed.
```
