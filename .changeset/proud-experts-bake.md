---
"geohub": patch
---

fix: some old map style has tileMatrixSetId in the URL param, but new titiler requires tileMatrixSetId as path param.

For example, new URL will be like below after replacing old saved URL.

- Old URL: /cog/tiles/{z}/{x}/{y}.png?TileMatrixSetId=WebMercatorQuad
- New URL: /cog/tiles/WebMercatorQuad/{z}/{x}/{y}.png
