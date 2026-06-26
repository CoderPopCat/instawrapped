# Privacy Policy

**TL;DR — your Instagram data never leaves your device. Ever.**

InstaWrapped processes everything locally in your browser. There is no backend, no database, and no server that receives your data.

---

## What happens when you upload your ZIP

1. Your browser reads the `.zip` file directly from your disk using the [File API](https://developer.mozilla.org/en-US/docs/Web/API/File).
2. The ZIP is decompressed in memory using [fflate](https://github.com/101arrowz/fflate) — a pure-JavaScript library that runs entirely client-side.
3. All JSON parsing, counting, and analysis happens inside a [Web Worker](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) — a browser thread with no network access.
4. Results are passed back to the page via `postMessage`. The data lives only in your browser's memory tab and is discarded the moment you close or refresh the page.

**At no point is any data sent over the network.**

---

## What we do NOT collect

| Thing | Collected? |
|---|---|
| Your Instagram username | No |
| Your messages or DMs | No |
| Your followers / following lists | No |
| Your likes, comments, or saved posts | No |
| Your profile information | No |
| Any statistics or aggregated counts | No |
| Crash reports or error logs | No |
| Analytics or page-view tracking | No |
| Cookies (beyond what Next.js needs to serve the page) | No |

---

## How to verify this yourself

You don't have to take my word for it.

**Option 1 — Watch the Network tab**
1. Open your browser's DevTools (`F12` or `Cmd+Option+I`)
2. Go to the **Network** tab and filter by **Fetch/XHR**
3. Upload your Instagram ZIP
4. Watch the network tab stay completely empty during processing

**Option 2 — Use it offline**
After the page has loaded, disconnect your internet and upload your ZIP. Everything works because there is no server call to make.

**Option 3 — Read the code**
The single file that touches your data is [`app/mywrap/parser.worker.js`](app/mywrap/parser.worker.js). It contains no `fetch`, no `XMLHttpRequest`, and no WebSocket — only `self.onmessage` and `self.postMessage`. You can audit it in under five minutes.

---

## Open source

InstaWrapped is fully open source under the MIT license. Every line of code that runs in your browser is publicly readable on GitHub. Self-hosting is supported — you can run your own instance with no external dependencies.

→ [github.com/CoderPopCat/instawrapped](https://github.com/CoderPopCat/instawrapped)

---

## Third-party libraries

The page uses a small number of open-source JavaScript libraries (React, Next.js, fflate, shadcn/ui, Recharts). None of them are configured to phone home or collect user data.

The page is hosted on [Vercel](https://vercel.com). Vercel may log standard web-server access logs (IP address, request path, timestamp) as part of serving the HTML/JS assets, consistent with their [privacy policy](https://vercel.com/legal/privacy-policy). This is indistinguishable from any other website you visit and contains no Instagram data.

---

## Changes to this policy

If this policy ever changes in a meaningful way, the diff will be publicly visible in the GitHub commit history.

---

*Last updated: June 2026*