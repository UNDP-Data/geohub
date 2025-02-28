---
"geohub": patch
---

fix: added 'exclude_chapter' to /api/storymaps endpoint to remove chapters from search result as default. so it can make the performance a bit faster since chapters may contain massive data and images.
