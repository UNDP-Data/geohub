---
"geohub": patch
---

fix: avoid accessing $page store inside <svelte:head> in server side. Moved some variables to load function in +layout.server.ts
