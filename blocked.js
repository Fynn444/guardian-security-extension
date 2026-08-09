"use strict";

const params = new URLSearchParams(location.search);
const target = params.get("url") || "";
const score = Math.max(0, Math.min(100, Number(params.get("score")) || 0));
const severity = params.get("severity") || "suspicious";

let reasons = [];
try {
  reasons = JSON.parse(params.get("reasons") || "[]");
  if (!Array.isArray(reasons)) reasons = [];
} catch {}

document.getElementById("blocked-url").textContent = target || "Unknown";
document.getElementById("risk-score").textContent = `${score}/100`;
document.getElementById("severity").textContent =
  severity.charAt(0).toUpperCase() + severity.slice(1);

const reasonsList = document.getElementById("reasons");
(reasons.length ? reasons : ["The destination matched a security rule."]).forEach(reason => {
  const li = document.createElement("li");
  li.textContent = String(reason);
  reasonsList.appendChild(li);
});

document.getElementById("back").addEventListener("click", () => {
  if (history.length > 1) history.back();
  else location.href = "https://www.google.com/";
});

document.getElementById("proceed").addEventListener("click", async () => {
  if (!target) return;
  try {
    const response = await chrome.runtime.sendMessage({ type: "TEMP_ALLOW", url: target });
    if (response?.ok) location.href = target;
  } catch {}
});

document.getElementById("allowlist").addEventListener("click", async () => {
  if (!target) return;
  try {
    const hostname = new URL(target).hostname;
    const response = await chrome.runtime.sendMessage({
      type: "ADD_ALLOWLIST",
      hostname
    });
    if (response?.ok) location.href = target;
  } catch {}
});
