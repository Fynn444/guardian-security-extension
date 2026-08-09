(() => {
  "use strict";

  const { unwrapGoogleURL, isOutboundWebURL } =
    globalThis.GuardianSearchUtils;

  const CHECKED = "data-guardian-security-checked";
  const WARNING_CLASS = "guardian-security-warning";
  const CACHE_TTL_MS = 5 * 60 * 1000;
  const verdictCache = new Map();
  const countedURLs = new Set();

  function getCachedVerdict(url) {
    const entry = verdictCache.get(url);
    if (!entry) return null;

    if (Date.now() - entry.time > CACHE_TTL_MS) {
      verdictCache.delete(url);
      return null;
    }

    return entry.verdict;
  }

  function setCachedVerdict(url, verdict) {
    verdictCache.set(url, {
      verdict,
      time: Date.now()
    });

    if (verdictCache.size > 500) {
      const oldestKey = verdictCache.keys().next().value;
      if (oldestKey) verdictCache.delete(oldestKey);
    }
  }

  function makeBadge(verdict) {
    const badge = document.createElement("span");
    badge.className = WARNING_CLASS;
    badge.dataset.guardianRisk = String(verdict.score || 0);
    badge.setAttribute("role", "status");

    const reasons = Array.isArray(verdict.reasons)
      ? verdict.reasons.join(". ")
      : "Suspicious destination";

    badge.setAttribute(
      "aria-label",
      `Guardian Security warning. Risk score ${verdict.score}. ${reasons}`
    );

    const icon = document.createElement("span");
    icon.textContent = "⚠";
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.textContent =
      verdict.score >= 70 ? "HIGH RISK" : "SUSPICIOUS";

    badge.append(icon, label);
    badge.title = `Risk ${verdict.score}/100 — ${reasons}`;

    return badge;
  }

  function isLikelySearchResultAnchor(anchor) {
    if (!(anchor instanceof HTMLAnchorElement)) return false;

    // Prefer anchors inside Google's result containers.
    if (anchor.closest("#search, #rso")) return true;

    // Google frequently places result titles inside h3 descendants.
    if (anchor.querySelector("h3") || anchor.closest("h3")) return true;

    return false;
  }

  async function requestVerdict(destination) {
    const cached = getCachedVerdict(destination);
    if (cached) return cached;

    try {
      const response = await chrome.runtime.sendMessage({
        type: "ANALYZE_URL",
        url: destination
      });

      if (!response?.ok || !response.verdict) return null;

      setCachedVerdict(destination, response.verdict);
      return response.verdict;
    } catch {
      return null;
    }
  }

  async function inspect(anchor) {
    if (!(anchor instanceof HTMLAnchorElement)) return;
    if (anchor.hasAttribute(CHECKED)) return;

    anchor.setAttribute(CHECKED, "1");

    if (!isLikelySearchResultAnchor(anchor)) return;

    const destination = unwrapGoogleURL(anchor.href, location.href);

    if (!destination || !isOutboundWebURL(destination)) return;

    const verdict = await requestVerdict(destination);

    if (!verdict?.suspicious) return;

    const parent = anchor.parentElement;
    if (parent?.querySelector(`:scope > .${WARNING_CLASS}`)) return;

    anchor.insertAdjacentElement("afterend", makeBadge(verdict));

    if (!countedURLs.has(destination)) {
      countedURLs.add(destination);

      chrome.runtime.sendMessage({
        type: "SEARCH_WARNING_RECORDED"
      }).catch(() => {});
    }
  }

  function scan(root = document) {
    if (root instanceof HTMLAnchorElement) {
      inspect(root);
    }

    root.querySelectorAll?.("#search a[href], #rso a[href], a[href] h3")
      .forEach(element => {
        const anchor =
          element instanceof HTMLAnchorElement
            ? element
            : element.closest("a[href]");

        if (anchor) inspect(anchor);
      });
  }

  scan();

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) {
          scan(node);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
