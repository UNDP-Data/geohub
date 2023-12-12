---
"geohub": patch
---

fix: fixed bug of checking STAC asset item type. it is preferred to use `image/tiff; application=geotiff; profile=cloud-optimized` to check asset type, but we found some of COG from some STAC server, they don't put `profile=cloud-optimized`. So I removed profile from validation. There might be normal GeoTiff coming from STAC server, but we can assume all GeoTiffs are cloud optiomised GeoTiff from STAC.
