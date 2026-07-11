// Toolbar popup: type-and-hear box. Runs in the extension's own page context,
// so it can play audio directly (no page CSP, real user gesture on click).

const MAX_LEN = 200;

function clean(s) {
  return (s || "").trim().replace(/\s+/g, " ").slice(0, MAX_LEN);
}

function speak(text) {
  if (!text) return;
  const url =
    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" +
    encodeURIComponent(text);
  const audio = new Audio(url);
  audio.addEventListener("error", () => fallback(text));
  audio.play().catch(() => fallback(text));
}

function fallback(text) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  } catch (_) {}
}

const q = document.getElementById("q");
const say = document.getElementById("say");

say.addEventListener("click", () => speak(clean(q.value)));
q.addEventListener("keydown", (e) => {
  if (e.key === "Enter") speak(clean(q.value));
});
q.focus();
