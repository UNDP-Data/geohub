---
"geohub": patch
---

fix: previously, the order of layers in sidebar is opposite from what maplibre renders. That makes some confusion and users do not realize the first layer is actually rendered the bottom of second layer. This will bring duplicated layer to the top, so it will be the same order of maplibre.
