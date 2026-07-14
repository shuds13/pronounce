// Shared pronunciation resolver, used by both the background page and the popup.
//
//   "google"  — Google Translate TTS: synthesizes any word, name, or phrase.
//   "browser" — the browser's built-in speech synthesis (offline fallback,
//               only used if the Google request fails).
//
// pronounce(text) resolves to the source code actually used, so the UI can show
// where the audio came from.

function pronounce(text) {
  const t = (text || "").trim();
  if (!t) return Promise.resolve(null);
  const url =
    "https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=en&q=" +
    encodeURIComponent(t);
  return playUrl(url)
    .then(() => "google")
    .catch(() => {
      browserSpeak(t);
      return "browser";
    });
}

function playUrl(url) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    audio.addEventListener("error", () => reject(), { once: true });
    audio.play().then(resolve, reject);
  });
}

function browserSpeak(text) {
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-US";
    speechSynthesis.speak(u);
  } catch (_) {}
}

// Human-readable label for a source code.
function sourceLabel(code) {
  return code === "google"
    ? "Google text-to-speech"
    : code === "browser"
    ? "browser voice"
    : "";
}
