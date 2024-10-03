---
"geohub": patch
---

fix: when there are multiple algorithms are linked to raster dataset such as Rwanda DEM, geohub fetched metadata for the first algorithm even if user does not select an algorithm to add. Fixed the bug for this to return normal metadata without algorithm.
