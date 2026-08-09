(() => {
  "use strict";

  const CHECKED = "data-guardian-security-checked";
  const WARNING_CLASS = "guardian-security-warning";
  const GOOGLE_HOST = /(^|\.)google\.com$/i;
  const counted = new Set();

  function extractDestination(anchor) {
    if (!anchor?.href) return null;

    try {
      const parsed = new URL(anchor.href, location.href);
      if (GOOGLE_HOST.test(parsed.hostname) && parsed.pathname === "/url") {
        return parsed.searchParams.get("q") ||
          parsed.searchParams.get("url") ||
          null;
      }
      return parsed.href;
    } catch {
      return null;
    }
  }

  function shouldInspect(url) {
    try {
      const parsed = new URL(url);
      if (!["http:", "https:"].includes(parsed.protocol)) return false;
      return !GOOGLE_HOST.test(parsed.hostname);
    } catch {
      return false;
    }
  }

  function makeBadge(verdict) {
    const badge = document.createElement("span");
    badge.className = WARNING_CLASS;
    badge.setAttribute("role", "status");
    badge.setAttribute(
      "aria-label",
      `Guardian Security warning. Risk score ${verdict.score}. ${verdict.reasons.join(". ")}`
    );

    const icon = document.createElement("span");
    icon.textContent = "⚠";
    icon.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.textContent = verdict.score >= 70 ? "DANGEROUS?" : "SUSPICIOUS";

    badge.append(icon, label);
    badge.title = `Risk ${verdict.score}/100 — ${verdict.reasons.join("; ")}`;
    return badge;
  }

  async function inspect(anchor) {
    if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute(CHECKED)) return;
    anchor.setAttribute(CHECKED, "1");

    const destination = extractDestination(anchor);
    if (!destination || !shouldInspect(destination)) return;

    let response;
    try {
      response = await chrome.runtime.sendMessage({
        type: "ANALYZE_URL",
        url: destination
      });
    } catch {
      return;
    }

    const verdict = response?.verdict;
    if (!response?.ok || !verdict?.suspicious) return;

    if (anchor.parentElement?.querySelector(`:scope > .${WARNING_CLASS}`)) return;

    anchor.insertAdjacentElement("afterend", makeBadge(verdict));

    if (!counted.has(destination)) {
      counted.add(destination);
      chrome.runtime.sendMessage({ type: "SEARCH_WARNING_RECORDED" }).catch(() => {});
    }
  }

  function scan(root = document) {
    if (root instanceof HTMLAnchorElement) inspect(root);
    root.querySelectorAll?.("a[href]").forEach(inspect);
  }

  scan();

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node instanceof Element) scan(node);
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
