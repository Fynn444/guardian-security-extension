# Changelog

All notable changes to this project will be documented in this file.

The format is inspired by Keep a Changelog.

## [1.0.1] - 2026-08-09

### Fixed

- Prevented security-related words inside search-engine query parameters from causing the search page itself to be blocked.
- Keyword heuristics now evaluate hostname/path/fragment instead of arbitrary query-string text.
- Embedded-credential detection now checks actual URL credentials instead of harmless `@` characters inside query parameters.
- Long or heavily encoded search-engine URLs no longer receive generic risk points solely because of normal search parameters.

### Added

- Regression tests for searches containing phishing/malware terminology.

## [1.0.0] - 2026-08-09

### Added

- Manifest V3 Chrome extension foundation.
- Shared local URL risk analyzer.
- Top-level navigation inspection.
- Suspicious-site warning interstitial.
- Google search-result link scanning.
- Suspicious-result warning badges.
- Local allowlist and blocklist management.
- Dynamic `declarativeNetRequest` rules for blocked domains.
- Five-minute "proceed once" temporary exceptions.
- Popup protection controls and local statistics.
- Options page for list management.
- Restrictive extension content security policy.
- Privacy, security, validation, and contribution documentation.
