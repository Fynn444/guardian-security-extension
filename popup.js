"use strict";

const DEFAULT_SETTINGS = {
  protectionEnabled: true,
  searchScanningEnabled: true,
  showLowRiskSearchWarnings: false,
  lookalikeDetectionEnabled: true
};

async function load() {
  const data = await chrome.storage.local.get(["settings", "stats"]);
  const settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
  const stats = { blockedCount: 0, warnedSearchLinks: 0, ...(data.stats || {}) };

  protection.checked = settings.protectionEnabled;
  document.getElementById("search-scanning").checked = settings.searchScanningEnabled;
  document.getElementById("lookalike-detection").checked = settings.lookalikeDetectionEnabled;
  document.getElementById("blocked-count").textContent = stats.blockedCount;
  document.getElementById("warned-count").textContent = stats.warnedSearchLinks;

  const status = document.getElementById("status");
  status.classList.toggle("off", !settings.protectionEnabled);
  document.getElementById("status-title").textContent =
    settings.protectionEnabled ? "Protection active" : "Protection paused";
  document.getElementById("status-copy").textContent =
    settings.protectionEnabled ? "Navigation checks are enabled." : "Suspicious navigation will not be redirected.";
}

const protection = document.getElementById("protection");

async function updateSetting(key, value) {
  const { settings = {} } = await chrome.storage.local.get("settings");
  await chrome.storage.local.set({ settings: { ...DEFAULT_SETTINGS, ...settings, [key]: value } });
  await load();
}

protection.addEventListener("change", () => updateSetting("protectionEnabled", protection.checked));
document.getElementById("search-scanning").addEventListener("change", event =>
  updateSetting("searchScanningEnabled", event.target.checked)
);
document.getElementById("options").addEventListener("click", () => chrome.runtime.openOptionsPage());

load();

document.getElementById("lookalike-detection").addEventListener("change", event =>
  updateSetting("lookalikeDetectionEnabled", event.target.checked)
);
