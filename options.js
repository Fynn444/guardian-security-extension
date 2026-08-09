"use strict";

function normalizeDomain(value) {
  let raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";

  try {
    if (raw.includes("://")) raw = new URL(raw).hostname;
  } catch {
    return "";
  }

  raw = raw.replace(/^\.+|\.+$/g, "");
  if (!/^[a-z0-9.-]+$/.test(raw) || raw.includes("..") || !raw.includes(".")) return "";
  return raw;
}

async function getLists() {
  const data = await chrome.storage.local.get(["allowlist", "blocklist"]);
  return {
    allowlist: Array.isArray(data.allowlist) ? data.allowlist : [],
    blocklist: Array.isArray(data.blocklist) ? data.blocklist : []
  };
}

function renderList(container, items, type) {
  container.replaceChildren();

  if (!items.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = type === "allow" ? "No trusted domains yet." : "No blocked domains yet.";
    container.appendChild(empty);
    return;
  }

  items.forEach(domain => {
    const row = document.createElement("div");
    row.className = "item";

    const code = document.createElement("code");
    code.textContent = domain;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => removeDomain(type, domain));

    row.append(code, remove);
    container.appendChild(row);
  });
}

async function render() {
  const { allowlist, blocklist } = await getLists();
  renderList(document.getElementById("allow-list"), allowlist, "allow");
  renderList(document.getElementById("block-list"), blocklist, "block");
}

function showMessage(text) {
  document.getElementById("message").textContent = text;
  setTimeout(() => {
    if (document.getElementById("message").textContent === text) {
      document.getElementById("message").textContent = "";
    }
  }, 2200);
}

async function addDomain(type, value) {
  const domain = normalizeDomain(value);
  if (!domain) {
    showMessage("Enter a valid hostname, for example example.com.");
    return false;
  }

  const lists = await getLists();
  const targetKey = type === "allow" ? "allowlist" : "blocklist";
  const otherKey = type === "allow" ? "blocklist" : "allowlist";

  lists[targetKey] = [...new Set([...lists[targetKey], domain])].sort();
  lists[otherKey] = lists[otherKey].filter(item => item !== domain);

  await chrome.storage.local.set({
    allowlist: lists.allowlist,
    blocklist: lists.blocklist
  });
  await chrome.runtime.sendMessage({ type: "REBUILD_DNR" });
  await render();
  showMessage(`${domain} saved.`);
  return true;
}

async function removeDomain(type, domain) {
  const lists = await getLists();
  const key = type === "allow" ? "allowlist" : "blocklist";
  lists[key] = lists[key].filter(item => item !== domain);
  await chrome.storage.local.set({ [key]: lists[key] });
  await chrome.runtime.sendMessage({ type: "REBUILD_DNR" });
  await render();
  showMessage(`${domain} removed.`);
}

document.getElementById("allow-form").addEventListener("submit", async event => {
  event.preventDefault();
  const input = document.getElementById("allow-input");
  if (await addDomain("allow", input.value)) input.value = "";
});

document.getElementById("block-form").addEventListener("submit", async event => {
  event.preventDefault();
  const input = document.getElementById("block-input");
  if (await addDomain("block", input.value)) input.value = "";
});

document.getElementById("reset-stats").addEventListener("click", async () => {
  await chrome.storage.local.set({
    stats: { blockedCount: 0, warnedSearchLinks: 0 },
    temporaryAllows: {}
  });
  showMessage("Statistics reset.");
});

render();
