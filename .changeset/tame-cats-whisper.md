---
"geohub": patch
---

fix: Postgres Function Layer will use source URL by changing function parameters, hence, if the dataset is Function layer, unique UUID is used as source ID. Otherwise, dataset ID is used to share with other layers
