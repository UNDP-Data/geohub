---
"geohub": patch
---

fix: previously simulation button on CEEI dashboard was disabled when the page is shown. Now the button is enabled on initial page shown. This bug was caused by svelte 5 migration which did not bind layer variable to the component correctly.
