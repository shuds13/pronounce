// Pronounce — background event page (Firefox MV3)
//
// Speaks the selected text using Google Translate's TTS voice (handles any
// word OR name, e.g. "Clemenceau"), with the browser's built-in speech
// synthesis as an automatic fallback if the network voice is unavailable.
//
// All audio is played here in the background page — NOT in the web page — so
// it is immune to the page's Content-Security-Policy (which is what broke the
// old in-page approach on sites like Wikipedia). Playing audio via an <audio>
// element needs no host permission, so the extension still requests no broad
// permissions: only contextMenus, activeTab, and scripting.

const MENU_ID = "pronounce-selection";
const MAX_LEN = 200; // Google TTS endpoint rejects very long strings

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

  speak(text);

  // activeTab grants access to this tab for this user gesture — used only to
  // draw the little confirmation tooltip and offer a replay button.
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: showTip,
    args: [text],
  });
});

// Replay button inside the injected tooltip asks the background to speak again.
chrome.runtime.onMessage.addListener((msg) => {
  if (msg?.type === "pronounce" && msg.text) speak(clean(msg.text));
});

function clean(s) {
  return (s || "").trim().replace(/\s+/g, " ").slice(0, MAX_LEN);
}

function speak(text) {
  const url =
    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" +
    encodeURIComponent(text);
  const audio = new Audio(url);
  audio.addEventListener("error", () => speechFallback(text));
  audio.play().catch(() => speechFallback(text));
}

// Offline / no-network fallback: the browser's own speech synthesis. Also
// pronounces any string, though with the OS voice rather than Google's.
function speechFallback(text) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  } catch (_) {}
}

// Injected into the active page: draws a small dismissable card with the text
// and a replay button. Pure DOM/style work, so it is CSP-safe on every site.
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
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "default",
  });
  tip.setAttribute("role", "status");

  tip.append(el("span", { textContent: "🔊 " + text }));

  const btn = el("button", { title: "Play again", textContent: "↻" }, {
    all: "unset", cursor: "pointer", fontSize: "16px", padding: "2px 6px",
  });
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    chrome.runtime.sendMessage({ type: "pronounce", text });
  });
  tip.append(btn);

  document.body.appendChild(tip);
  const dismiss = () => tip.remove();
  setTimeout(dismiss, 5000);
  tip.addEventListener("click", (e) => { if (e.target !== btn) dismiss(); });
}
