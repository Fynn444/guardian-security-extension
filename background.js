"use strict";

importScripts("lib/analyzer.js", "lib/defaults.js");

const { analyzeURL, normalizeHostname } = globalThis.SecurityAnalyzer;
const DEFAULTS = globalThis.GuardianDefaults;

const DNR_RULE_START = 10000;
const TEMP_ALLOW_MS = 5 * 60 * 1000;
const BLOCK_DEBOUNCE_MS = 1500;
const recentBlocks = new Map();

async function getState() {
  const stored = await chrome.storage.local.get([
    "settings", "stats", "allowlist", "blocklist", "temporaryAllows"
  ]);

  return {
    settings: { ...DEFAULTS.settings, ...(stored.settings || {}) },
    stats: { ...DEFAULTS.stats, ...(stored.stats || {}) },
    allowlist: Array.isArray(stored.allowlist) ? stored.allowlist : [],
    blocklist: Array.isArray(stored.blocklist) ? stored.blocklist : [],
    temporaryAllows: stored.temporaryAllows || {}
  };
}

async function initializeState() {
  const state = await getState();
  await chrome.storage.local.set(state);
  await rebuildBlocklistRules(state.blocklist);
}

function hostMatchesList(hostname, list) {
  const host = normalizeHostname(hostname);
  return list.some(entry => {
    const candidate = normalizeHostname(entry);
    return host === candidate || host.endsWith(`.${candidate}`);
  });
}

function cleanExpiredTemporaryAllows(map) {
  const now = Date.now();
  const cleaned = {};
  for (const [host, expiry] of Object.entries(map || {})) {
    if (Number(expiry) > now) cleaned[host] = Number(expiry);
  }
  return cleaned;
}

async function isTemporarilyAllowed(hostname, state) {
  const map = cleanExpiredTemporaryAllows(state.temporaryAllows);
  if (Object.keys(map).length !== Object.keys(state.temporaryAllows).length) {
    await chrome.storage.local.set({ temporaryAllows: map });
  }

  const host = normalizeHostname(hostname);
  return Object.entries(map).some(([entry, expiry]) =>
    expiry > Date.now() && (host === entry || host.endsWith(`.${entry}`))
  );
}

function blockedPageURL(url, verdict, source = "navigation") {
  const page = new URL(chrome.runtime.getURL("blocked.html"));
  page.searchParams.set("url", url);
  page.searchParams.set("score", String(verdict.score || 100));
  page.searchParams.set("severity", verdict.severity || "high");
  page.searchParams.set("source", source);
  page.searchParams.set("reasons", JSON.stringify(verdict.reasons || ["Blocked by user rule"]));
  return page.toString();
}

async function recordBlock(url) {
  const now = Date.now();
  const previous = recentBlocks.get(url) || 0;
  if (now - previous < BLOCK_DEBOUNCE_MS) return;
  recentBlocks.set(url, now);

  const { stats } = await getState();
  stats.blockedCount += 1;
  await chrome.storage.local.set({ stats });

  for (const [key, value] of recentBlocks) {
    if (now - value > 10000) recentBlocks.delete(key);
  }
}

async function evaluateNavigation(details) {
  if (details.frameId !== 0 || details.tabId < 0) return;

  const url = details.url;
  if (!url || url.startsWith(chrome.runtime.getURL(""))) return;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return;
  }

  if (!["http:", "https:"].includes(parsed.protocol)) return;

  const state = await getState();
  if (!state.settings.protectionEnabled) return;

  const hostname = normalizeHostname(parsed.hostname);

  if (hostMatchesList(hostname, state.allowlist)) return;
  if (await isTemporarilyAllowed(hostname, state)) return;

  let verdict;
  let source = "heuristic";

  if (hostMatchesList(hostname, state.blocklist)) {
    verdict = {
      suspicious: true,
      score: 100,
      severity: "high",
      reasons: ["Domain is on your local blocklist"]
    };
    source = "blocklist";
  } else {
    verdict = analyzeURL(url, { enableLookalikeDetection: state.settings.lookalikeDetectionEnabled });
  }

  if (!verdict.suspicious) return;

  await recordBlock(url);

  try {
    await chrome.tabs.update(details.tabId, {
      url: blockedPageURL(url, verdict, source)
    });
  } catch (error) {
    console.warn("Guardian Security: redirect failed", error);
  }
}

chrome.webNavigation.onBeforeNavigate.addListener(details => {
  evaluateNavigation(details).catch(error =>
    console.error("Guardian Security navigation analysis failed:", error)
  );
});

chrome.runtime.onInstalled.addListener(() => {
  initializeState().catch(console.error);
});

chrome.runtime.onStartup.addListener(() => {
  initializeState().catch(console.error);
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  (async () => {
    if (!message || typeof message.type !== "string") {
      sendResponse({ ok: false, error: "Invalid message" });
      return;
    }

    if (message.type === "ANALYZE_URL") {
      const state = await getState();
      if (!state.settings.searchScanningEnabled) {
        sendResponse({ ok: true, verdict: { suspicious: false, score: 0, reasons: [] } });
        return;
      }

      let hostname = "";
      try { hostname = new URL(message.url).hostname; } catch {}

      if (hostname && hostMatchesList(hostname, state.allowlist)) {
        sendResponse({ ok: true, verdict: { suspicious: false, score: 0, reasons: [] } });
        return;
      }

      if (hostname && hostMatchesList(hostname, state.blocklist)) {
        sendResponse({
          ok: true,
          verdict: {
            suspicious: true,
            score: 100,
            severity: "high",
            reasons: ["Domain is on your local blocklist"]
          }
        });
        return;
      }

      sendResponse({ ok: true, verdict: analyzeURL(message.url, { enableLookalikeDetection: state.settings.lookalikeDetectionEnabled }) });
      return;
    }

    if (message.type === "TEMP_ALLOW") {
      const url = new URL(message.url);
      const host = normalizeHostname(url.hostname);
      const state = await getState();
      const temporaryAllows = cleanExpiredTemporaryAllows(state.temporaryAllows);
      temporaryAllows[host] = Date.now() + TEMP_ALLOW_MS;
      await chrome.storage.local.set({ temporaryAllows });
      sendResponse({ ok: true, expiresInMs: TEMP_ALLOW_MS });
      return;
    }

    if (message.type === "ADD_ALLOWLIST") {
      const host = normalizeHostname(message.hostname);
      const state = await getState();
      const allowlist = [...new Set([...state.allowlist, host])].filter(Boolean).sort();
      const blocklist = state.blocklist.filter(item => normalizeHostname(item) !== host);
      await chrome.storage.local.set({ allowlist, blocklist });
      await rebuildBlocklistRules(blocklist);
      sendResponse({ ok: true });
      return;
    }

    if (message.type === "SEARCH_WARNING_RECORDED") {
      const state = await getState();
      state.stats.warnedSearchLinks += 1;
      await chrome.storage.local.set({ stats: state.stats });
      sendResponse({ ok: true });
      return;
    }

    if (message.type === "REBUILD_DNR") {
      const state = await getState();
      await rebuildBlocklistRules(state.blocklist);
      sendResponse({ ok: true });
      return;
    }

    sendResponse({ ok: false, error: "Unknown message type" });
  })().catch(error => {
    console.error(error);
    sendResponse({ ok: false, error: String(error.message || error) });
  });

  return true;
});

async function rebuildBlocklistRules(blocklist) {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  const managedIds = existing
    .map(rule => rule.id)
    .filter(id => id >= DNR_RULE_START && id < DNR_RULE_START + 10000);

  const rules = blocklist.slice(0, 5000).map((domain, index) => ({
    id: DNR_RULE_START + index,
    priority: 1,
    action: { type: "block" },
    condition: {
      requestDomains: [normalizeHostname(domain)],
      resourceTypes: ["main_frame"]
    }
  }));

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: managedIds,
    addRules: rules
  });
}
