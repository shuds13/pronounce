// Toolbar popup: type-and-hear box + a "Search Google" link. Uses the shared
// pronounce() resolver (speak.js) and shows which source produced the audio.

const MAX_LEN = 200;

function clean(s) {
  return (s || "").trim().replace(/\s+/g, " ").slice(0, MAX_LEN);
}

const q = document.getElementById("q");
const say = document.getElementById("say");
const src = document.getElementById("src");
const gsearch = document.getElementById("gsearch");

function go() {
  const text = clean(q.value);
  if (!text) return;
  src.textContent = "…";
  pronounce(text).then((code) => {
    src.textContent = code ? "source: " + sourceLabel(code) : "";
  });
}

say.addEventListener("click", go);
q.addEventListener("keydown", (e) => {
  if (e.key === "Enter") go();
});

gsearch.addEventListener("click", () => {
  const text = clean(q.value);
  if (!text) {
    q.focus();
    return;
  }
  const url =
    "https://www.google.com/search?q=" +
    encodeURIComponent('pronounce "' + text + '"');
  chrome.tabs.create({ url });
});

q.focus();
