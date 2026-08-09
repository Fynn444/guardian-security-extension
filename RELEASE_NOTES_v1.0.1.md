# Guardian Security v1.0.1

This maintenance release fixes a false positive discovered during real-browser testing of v1.0.0.

## Fixed

- Google searches containing words such as `phishing`, `malware`, or `fake` no longer cause the Google results page itself to be blocked.
- Suspicious keyword detection now focuses on hostname/path rather than arbitrary query-string text.
- Harmless `@` characters inside query parameters are no longer treated as embedded URL credentials.
- Normal long/encoded search-engine URLs no longer receive generic risk points solely because of search parameters.

## Still works

- Direct suspicious paths such as `https://example.com/phishing-test` are still blocked.
- Google search-result scanning remains enabled.
- Allowlist/blocklist behavior is unchanged.
- "Proceed once" behavior is unchanged.
