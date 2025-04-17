---
"@undp-data/svelte-geohub-static-image-controls": patch
"@undp-data/svelte-undp-components": patch
"@undp-data/svelte-undp-design": patch
"geohub": patch
---

fix: remove $bindable from toggled property of Switch component in UNDP Design System because of some issue of reactivity in svelte 5. Use onchange event instead.
