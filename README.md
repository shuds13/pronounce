# Pronounce

A minimal Firefox extension: select a word or name, right-click, and choose
Pronounce to hear it spoken.

**Install:** https://addons.mozilla.org/en-US/firefox/addon/pronounce/

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

Installs with no permission prompt — nothing for users to approve. It uses only
`contextMenus`, `activeTab`, and `scripting`, and requests no access to your
data on websites, downloads, or tabs.

## Run from source

1. Open `about:debugging` in Firefox → **This Firefox**
2. **Load Temporary Add-on…** → select `manifest.json`

## Files

- `manifest.json` — MV3 manifest
- `background.js` — context menu, TTS playback, tooltip injection
- `popup.html` / `popup.js` — toolbar popup with instructions and type-to-hear box
- `icons/` — toolbar/listing icons
