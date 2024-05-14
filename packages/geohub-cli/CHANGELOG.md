# @undp-data/geohub-cli

## 2.0.5

### Patch Changes

- cf45612: refactor: drop martin support from GeoHub.

## 2.0.4

### Patch Changes

- 626ee6dc: chore: updated dependencies for packages and geohub repo

## 2.0.3

### Patch Changes

- 65fcbf0e: chore: pnpm update

## 2.0.2

### Patch Changes

- bf26a456: chore: pnpm update -r to update npm packages

## 2.0.1

### Patch Changes

- c8f5b2f1: chore: updated all npm packages except maplibre-gl

## 2.0.0

### Major Changes

- e481130f: disabled commands for azblob, pgtileserv and cogunit

## 1.1.2

### Patch Changes

- a2a3e01d: fix: removed schema name from name property for pgtileserv layer
- a2a3e01d: fix: added a command to migrate Unit from COG metadata to postgis (this command is only one-time used)

## 1.1.1

### Patch Changes

- 4bd349ee: feat: delete dataset_permission table if the dataset is deleted

## 1.1.0

### Minor Changes

- 171ac40: chore: updated dependencies of geohub-cli

## 1.0.9

### Patch Changes

- 0988a8c: added created_user and updated_user in dataset table

## 1.0.8

### Patch Changes

- 704c2b7: feat: remove source column from table and create tag for provider

## 1.0.7

### Patch Changes

- 838ba12: deleted storage table from PostGIS and updated geohub-cli not to use storage table anymore

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
