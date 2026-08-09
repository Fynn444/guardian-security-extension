# 🛡️ Guardian Security

**A local-first Chrome security extension that proactively detects suspicious websites and warns users about potentially dangerous links.**

Guardian Security is built with **Chrome Manifest V3** and provides protection at two important points: when navigating to a website and while browsing Google search results.

> **Current Release:** v1.0.1  
> **Status:** Early-stage security project  
> **License:** MIT  
> **Platform:** Google Chrome / Chromium

---

## ✨ Features

### 🛡️ Navigation Protection

Guardian analyzes top-level website navigation and warns the user when a destination crosses the configured local risk threshold.

Suspicious destinations are redirected to a dedicated warning page before the user continues.

### 🔎 Google Search Protection

Guardian scans outbound links displayed in Google search results.

Potentially suspicious destinations can be marked with a visible warning so users can identify risky links before opening them.

### 🚫 Custom Blocklist

Users can manually block domains.

Guardian converts blocked domains into Manifest V3 `declarativeNetRequest` rules for browser-level enforcement.

### ✅ Trusted Domain Allowlist

Known legitimate domains can be added to an allowlist to prevent unwanted warnings.

### ⏱️ Proceed Once

When Guardian blocks a destination, users can temporarily bypass the warning without permanently trusting the domain.

### 📊 Local Statistics

The extension tracks local counters such as:

- blocked navigation attempts;
- suspicious search-result warnings.

### 🔐 Local-First Privacy

The current version performs URL heuristic analysis locally.

**Guardian Security v1.0.1 does not upload your browsing URLs to a remote threat-intelligence service.**

---

## 📸 Screenshots

### 🛡️ Extension Popup

Guardian's popup provides quick access to protection controls, local statistics, and settings.

![Guardian Security extension popup](docs/screenshots/popup.png)

### ⚠️ Suspicious Website Warning

When a destination crosses Guardian's risk threshold, navigation is interrupted and the user is shown the detected risk, blocked destination, and reason for the warning.

![Guardian Security suspicious website warning](docs/screenshots/blocked-warning.png)

### 🔎 Google Search Protection

Guardian v1.0.1 correctly allows security-related Google searches without mistaking the search query itself for a malicious destination.

![Guardian Security Google search test](docs/screenshots/google-search-v1.0.1.png)

---

## 🚀 Installation

Guardian Security is currently distributed as an unpacked Chrome extension for development and testing.

### Install from a GitHub release

1. Open the latest Guardian Security release.
2. Download `Guardian-Security-v1.0.1.zip`.
3. Extract the ZIP file.
4. Open Chrome.
5. Navigate to:

```text
chrome://extensions
```

6. Enable **Developer mode**.
7. Click **Load unpacked**.
8. Select the extracted Guardian Security folder containing `manifest.json`.

Guardian Security should now appear in your extensions list.

---

## 🧪 Testing Guardian

You can safely test the local phishing heuristic using Example Domain:

```text
https://example.com/phishing-test
```

Guardian should display its suspicious-website warning page.

You can also search Google for security-related terminology such as:

```text
site:example.com phishing-test
```

Google itself should **not** be blocked. This behavior was corrected in v1.0.1.

> These URLs are used only to exercise Guardian's local heuristic logic. The presence of a keyword in a test URL does not mean the underlying Example Domain website is malicious.

---

## 🧠 How Detection Works

Guardian currently uses a local heuristic risk engine.

Signals can include:

- suspicious keywords in the destination hostname or path;
- embedded URL credentials;
- punycode hostnames;
- raw IP-address destinations;
- unusually deep subdomain structures;
- unusually long hostnames;
- selected higher-risk top-level domains;
- heavy URL encoding;
- unusually long URLs;
- non-standard web ports.

Signals contribute to a risk score.

When the score crosses Guardian's threshold, the destination is treated as suspicious.

### False-positive protection

Starting with **v1.0.1**, arbitrary query-string text is excluded from suspicious-keyword matching.

For example, searching Google for:

```text
phishing analysis
```

must not cause `google.com` itself to be classified as a phishing website.

---

## 🏗️ Architecture

```text
                  ┌──────────────────────┐
                  │    Chrome Browser    │
                  └──────────┬───────────┘
                             │
             ┌───────────────┴───────────────┐
             │                               │
             ▼                               ▼
    Top-Level Navigation              Google Search Page
             │                               │
             ▼                               ▼
      background.js                     content.js
             │                               │
             └───────────────┬───────────────┘
                             ▼
                      lib/analyzer.js
                             │
                             ▼
                       Risk Verdict
                     ┌───────┴───────┐
                     │               │
                   Safe         Suspicious
                     │               │
                  Continue      Warn / Flag
```

The project separates browser integration from URL-analysis logic so the detection engine can be expanded later.

---

## 📁 Project Structure

```text
guardian-security-extension/
├── .github/
├── icons/
├── lib/
│   ├── analyzer.js
│   └── defaults.js
├── tests/
│   └── analyzer.test.js
├── background.js
├── content.js
├── content.css
├── blocked.html
├── blocked.css
├── blocked.js
├── popup.html
├── popup.css
├── popup.js
├── options.html
├── options.css
├── options.js
├── manifest.json
├── CHANGELOG.md
├── CONTRIBUTING.md
├── PRIVACY.md
├── SECURITY.md
└── README.md
```

---

## 🌐 Future Threat Intelligence

The current release intentionally uses local heuristics.

A future production architecture could optionally integrate reputation providers such as VirusTotal, Google Web Risk, or URLhaus through a controlled backend.

```text
Chrome Extension
       │
       ▼
Guardian Reputation Backend
       │
       ├── Threat Intelligence Provider
       ├── Reputation Cache
       └── Rate Limiting
```

Private API keys should **not** be embedded directly inside a publicly distributed Chrome extension because extension packages can be inspected.

---

## 🗺️ Roadmap

Planned areas of development include:

- [x] Manifest V3 foundation
- [x] Local URL heuristic engine
- [x] Navigation warnings
- [x] Google result scanning
- [x] Allowlist and blocklist
- [x] Temporary bypass
- [x] Local statistics
- [x] Regression testing for search-query false positives
- [ ] Expanded automated test suite
- [ ] GitHub Actions CI
- [ ] Improved domain impersonation detection
- [ ] Additional search-engine support
- [ ] Reputation caching
- [ ] Optional threat-intelligence integration
- [ ] Chrome Web Store preparation

---

## ⚠️ Security Disclaimer

Guardian Security is an early-stage security project.

The local heuristic engine can produce both **false positives and false negatives**. Guardian should complement—not replace—Chrome Safe Browsing, endpoint security software, secure DNS, or other established security controls.

Never assume a website is safe solely because Guardian did not flag it.

---

## 🔒 Security & Privacy

Security vulnerabilities should not be disclosed through public issues when doing so could put users at risk.

See:

- `SECURITY.md` for vulnerability reporting guidance.
- `PRIVACY.md` for information about local data handling.

---

## 🤝 Contributing

Contributions, bug reports, testing, and security improvements are welcome.

Please read `CONTRIBUTING.md` before submitting a pull request.

---

## 📜 License

Guardian Security is released under the **MIT License**.

See `LICENSE` for the full license text.

---

## ⭐ Support the Project

If you find Guardian Security useful, consider starring the repository.

Stars help other developers discover the project and follow its development.
