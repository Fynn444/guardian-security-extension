# Contributing

Thanks for contributing to Guardian Security.

## Development setup

1. Fork and clone the repository.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the repository root.
6. After editing extension code, click **Reload** on the extension card.

## Code guidelines

- Keep the project compatible with Chrome Manifest V3.
- Keep executable JavaScript bundled locally.
- Avoid introducing remote code execution.
- Prefer small, reviewable changes.
- Keep URL-analysis logic centralized where practical.
- Never commit API keys, secrets, browser history, or user data.
- Treat allowlist/blocklist behavior as security-sensitive code.

## Testing changes

Before opening a pull request:

- confirm `manifest.json` parses;
- run JavaScript syntax checks;
- verify the extension loads without errors;
- test a benign URL;
- test a suspicious heuristic URL;
- test Google result annotations;
- test allowlist and blocklist behavior;
- confirm extension pages do not rely on inline executable JavaScript.

Useful local syntax checks:

```bash
node --check background.js
node --check content.js
node --check lib/analyzer.js
node --check blocked.js
node --check popup.js
node --check options.js
```

## Pull requests

Explain:

- what changed;
- why it changed;
- how you tested it;
- whether the change affects permissions, privacy, network access, or URL
  decision logic.

Security-sensitive changes may require additional review.
