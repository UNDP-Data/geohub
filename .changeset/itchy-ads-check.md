---
"geohub": patch
---

fix: replace http to https for titiler tilejson api's tile url if it starts with http, but not localhost. This is required because of our kubernetes has an issue of SSL certificate.
