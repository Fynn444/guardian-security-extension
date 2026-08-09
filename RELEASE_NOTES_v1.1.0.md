# Guardian Security v1.1.0

Guardian Security v1.1.0 focuses on stronger local phishing detection and more
reliable Google search-result scanning.

## New

- Domain-lookalike detection for a small set of high-value domains.
- A popup control for lookalike detection.
- Improved search-result URL extraction.
- Local verdict caching inside the Google content script.
- Machine-readable analyzer signals.
- Expanded automated regression tests.

## Examples

A close lookalike such as:

```text
https://paypa1.com/login
```

is now flagged as a possible PayPal impersonation.

The legitimate domain:

```text
https://paypal.com/login
```

is not treated as a lookalike.

## Privacy

v1.1.0 remains local-first and does not upload browsing URLs to a remote threat
intelligence service.
