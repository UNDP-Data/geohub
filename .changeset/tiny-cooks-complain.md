---
"geohub": patch
---

fix: add `compress` query param to /table endpoint to compress json/geojson response to gzip. If format is either `csv` or `xlsx`, `compress=true` will be ignored. Regarding to the use of compress API in Nodejs and Javascript, please refer to [this article](https://dev.to/ternentdotdev/json-compression-in-the-browser-with-gzip-and-the-compression-streams-api-4135).
