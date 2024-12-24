---
"geohub": patch
---

fix: use `/bounds?crs=EPSG:4326` to fetch bounds info in LngLat coordinates since the latest titiler does not return LngLat bounds from /info and /statistics.
