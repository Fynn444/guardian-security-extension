# Guardian Security

A local-first Google Chrome security extension built with **Manifest V3** that
proactively warns about suspicious destinations and marks risky links in Google
search results.

> **Status:** early-stage security project / demonstration. The current verdict
> engine uses local heuristics and can produce false positives. It is designed
> to be extended with a real threat-intelligence backend.

## Features

- **Navigation protection** — analyzes top-level HTTP/HTTPS navigation and
  redirects suspicious URLs to a safe warning page.
- **Google result scanning** — inspects outbound search-result links and adds a
  visible warning badge when a link crosses the local risk threshold.
- **Shared analyzer** — the background worker and search scanner use the same
  risk logic.
- **Allowlist** — permanently trust domains you know are legitimate.
- **Blocklist** — user-blocked domains are enforced with Manifest V3
  `declarativeNetRequest` dynamic rules.
- **Proceed once** — temporarily bypass a warning for five minutes.
- **Local controls** — popup settings, counters, and an options page.
- **Local-first privacy** — this version does not upload URLs to a remote
  reputation service.

## Install locally

1. Download or clone this repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository root.

## Quick test

Try:

```text
https://example.com/phishing-test
https://example.com/malicious-demo
```

Guardian should redirect the tab to its warning interstitial.

## Project structure

```text
guardian-security-extension/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── icons/
├── lib/
│   ├── analyzer.js
│   └── defaults.js
├── background.js
├── blocked.css
├── blocked.html
├── blocked.js
├── content.css
├── content.js
├── manifest.json
├── options.css
├── options.html
├── options.js
├── popup.css
├── popup.html
├── popup.js
├── CHANGELOG.md
├── CONTRIBUTING.md
├── LICENSE
├── PRIVACY.md
├── README.md
├── SECURITY.md
└── VALIDATION.md
```

## How detection works

The local analyzer currently scores indicators such as:

- suspicious URL keywords;
- embedded credentials or `@` characters;
- punycode hostnames;
- raw IP-address hosts;
- unusually deep subdomain chains;
- unusually long hosts or URLs;
- heavy URL encoding;
- selected higher-risk TLDs;
- non-standard web ports.

The threshold intentionally favors reducing false positives rather than trying
to classify every dangerous site.

## Architecture

### Navigation

`background.js` listens for top-level navigation events, checks user trust/block
rules, runs the local analyzer, and redirects suspicious destinations to
`blocked.html`.

### Search results

`content.js` runs on Google Search, extracts outbound result URLs, asks the
background worker for a verdict, and injects a visible warning badge next to
flagged links.

### Block rules

The options page stores a local user blocklist. The background worker converts
those hostnames into dynamic Manifest V3 `declarativeNetRequest` rules for
top-level blocking.

## Adding live threat intelligence

Do **not** embed a private VirusTotal or commercial threat-intelligence API key
inside a Chrome extension. Extension packages are inspectable.

A safer production architecture is:

```text
Chrome extension
      |
      v
Your authenticated reputation backend
      |
      +--> VirusTotal
      +--> Google Web Risk
      +--> URLhaus
      +--> other providers
```

A production reputation layer should include:

- strict request timeouts;
- hostname/result caching with TTLs;
- rate limiting;
- privacy-preserving requests where possible;
- clear user disclosure;
- a fail-open policy when the service is unavailable;
- a false-positive reporting process.

## Chrome limitation

A normal extension cannot arbitrarily intercept every keystroke typed into
Chrome's built-in address bar. Guardian evaluates the resulting top-level
navigation as early as the extension API allows. Explicitly blocklisted domains
also use `declarativeNetRequest`.

## Privacy

The current build stores only local extension state:

- settings;
- allowlist;
- blocklist;
- temporary allow decisions;
- aggregate local counters.

See [PRIVACY.md](PRIVACY.md).

## Security

Please report security-sensitive issues privately rather than opening a public
issue. See [SECURITY.md](SECURITY.md).

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).
