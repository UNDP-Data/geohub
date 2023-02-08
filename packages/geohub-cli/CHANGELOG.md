# @undp-data/geohub-cli

## 1.0.6

### Patch Changes

- cb5ae93: - doc: added dataset_favourite table to manage stars for each dataset/user
  - delete dataset_favourite when dataset is deleted.

## 1.0.5

### Patch Changes

- 5046874: Use name property from metadata.json or pmtiles's metadata instead of using file name if name property is present.

## 1.0.4

### Patch Changes

- ae19979: updated style table schema to add access level and user column

## 1.0.3

### Patch Changes

- e9f5548: pmtiles support for geohub-cli

## 1.0.2

### Patch Changes

- 8db36a3: fixed bug of upsert SQL for dataset table. In addition, now dataset will be removed from database if specified URL of blob does not exists.

## 1.0.1

### Patch Changes

- 58055ac: removed prepare script from packages
