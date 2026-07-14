// Pronounce — background event page (Firefox MV3)
//
// Adds the right-click "Pronounce" item, resolves audio via the shared
// pronounce() helper (see speak.js), and shows a small card noting which source
// was used. All audio plays here in the background page (immune to page CSP),
// and dictionary lookups go over CORS, so no host permissions are needed.

const MENU_ID = "pronounce-selection";
const MAX_LEN = 200;

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Pronounce "%s"',
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== MENU_ID || !tab?.id) return;
  const text = clean(info.selectionText);
  if (!text) return;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: showTip,
    args: [text],
  });
  pronounce(text).then((code) => setTipSource(tab.id, sourceLabel(code)));
});

// Replay button inside the injected card asks the background to speak again.
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg?.type === "pronounce" && msg.text) {
    pronounce(clean(msg.text)).then((code) => {
      if (sender.tab?.id) setTipSource(sender.tab.id, sourceLabel(code));
    });
  } else if (msg?.type === "gsearch" && msg.text) {
    chrome.tabs.create({
      url:
        "https://www.google.com/search?q=" +
        encodeURIComponent("pronounce " + clean(msg.text)),
    });
  }
});

function clean(s) {
  return (s || "").trim().replace(/\s+/g, " ").slice(0, MAX_LEN);
}

function setTipSource(tabId, label) {
  chrome.scripting.executeScript({
    target: { tabId },
    func: (l) => {
      const n = document.getElementById("__pronounce_src__");
      if (n) n.textContent = "source: " + l;
    },
    args: [label],
  });
}

// Injected into the active page: a small dismissable card with the text, a
// replay button, and a line showing which audio source was used.
function showTip(text) {
  const old = document.getElementById("__pronounce_tip__");
  if (old) old.remove();

  const el = (tag, props, styles) => {
    const n = document.createElement(tag);
    if (props) Object.assign(n, props);
    if (styles) Object.assign(n.style, styles);
    return n;
  };

  const tip = el("div", { id: "__pronounce_tip__" }, {
    position: "fixed",
    zIndex: "2147483647",
    top: "16px",
    right: "16px",
    maxWidth: "320px",
    padding: "10px 12px",
    background: "#1e1e2e",
    color: "#eaeaea",
    font: "14px/1.4 system-ui, sans-serif",
    borderRadius: "10px",
    boxShadow: "0 6px 24px rgba(0,0,0,.35)",
    cursor: "default",
  });
  tip.setAttribute("role", "status");

  const row = el("div", null, { display: "flex", alignItems: "center", gap: "8px" });
  row.append(el("span", { textContent: "🔊 " + text }, { flex: "1" }));

  const btn = el("button", { title: "Play again", textContent: "↻" }, {
    all: "unset", cursor: "pointer", fontSize: "16px", padding: "2px 6px",
  });
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const s = document.getElementById("__pronounce_src__");
    if (s) s.textContent = "…";
    chrome.runtime.sendMessage({ type: "pronounce", text });
  });
  row.append(btn);
  tip.append(row);

  tip.append(
    el("span", { id: "__pronounce_src__", textContent: "…" }, {
      display: "block", marginTop: "3px", fontSize: "11px", opacity: ".6",
    })
  );

  const gs = el("button", { textContent: "Search Google ↗", title: "Search Google for pronunciation" }, {
    all: "unset", cursor: "pointer", display: "block", marginTop: "6px",
    fontSize: "11px", color: "#7aa2f7", textDecoration: "underline",
  });
  gs.addEventListener("click", (e) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: "gsearch", text });
  });
  tip.append(gs);

  document.body.appendChild(tip);
  const dismiss = () => tip.remove();
  setTimeout(dismiss, 6000);
  tip.addEventListener("click", (e) => { if (e.target !== btn) dismiss(); });
}
