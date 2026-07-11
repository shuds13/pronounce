# Pronounce

A minimal Firefox extension: right-click any selected word or name to hear it
pronounced with Google's text-to-speech voice.

Built as a lightweight alternative to pronunciation add-ons that demand broad
permissions. Pronounce requests **none of the scary ones** — no "access your
data for all websites", no downloads, no tabs access.

## How it works

- Adds a single context-menu item, `Pronounce "…"`, on text selections.
- Or click the toolbar button and type any word or name into the box to hear it.
- Speaks the text using Google Translate's TTS endpoint, so it pronounces
  **any** string — real words *and* proper names (e.g. "Clemenceau").
- Falls back to the browser's built-in speech synthesis if the network voice is
  unavailable.
- Audio plays from the extension's background page, not the web page, so it is
  unaffected by a site's Content-Security-Policy (works on Wikipedia, etc.).

## Permissions

| Permission    | Why                                                    |
|---------------|--------------------------------------------------------|
| `contextMenus`| Adds the right-click "Pronounce" item                  |
| `activeTab`   | Access to the current tab, only on your click          |
| `scripting`   | Draws the small confirmation tooltip on that tab       |

No host permissions are requested.

## Install (temporary, for development)

1. Open `about:debugging` in Firefox → **This Firefox**
2. **Load Temporary Add-on…** → select `manifest.json`
3. Select a word or name on any page → right-click → **Pronounce "…"**

Temporary add-ons are removed when Firefox restarts. For a permanent install,
the package must be signed via [addons.mozilla.org](https://addons.mozilla.org).

## Files

- `manifest.json` — MV3 manifest
- `background.js` — context menu, TTS playback, tooltip injection
- `popup.html` / `popup.js` — toolbar popup with instructions and type-to-hear box
- `icons/` — toolbar/listing icons

## Note

This uses Google Translate's unofficial TTS endpoint, which has no formal
support guarantee and may rate-limit or change. The built-in speech-synthesis
fallback keeps the extension functional if that happens.
