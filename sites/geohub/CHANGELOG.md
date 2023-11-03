# geohub

## 0.4.5

### Patch Changes

- cca8098e: feat: add help message for raster and vector property editor. Also changed slider to select box for icon overlap property
- 7e37c1f9: fix: removed overlapped x axis label from histogram.
- ea2ed0a1: refactor: moved raster histogram feature to layer drop down menu
- ea2ed0a1: fix: hide raster band selector for RGB raster layer

## 0.4.4

### Patch Changes

- 8f9ef132: fix: fixes data table flickering when my data page is reloaded
- 7d80e994: refactor: Moved logic of layer style creation from client to server side endpoints

  - basically moved the logic of layer creation from RasterTileData and VectorTileData to the endpoint of `/api/datasets/{id}/style/{{layer}/{type}`
  - for STAC COG Item, `/stac/style/[type]/[colleciton]/[...item]/[asset]` was added to compute layer style
  - merged MosaicJsonData class to RasterDefaultStyleClass and RasterTileData
  - previously, layer style was created repeatedly without reusing preview data in MiniMap component, now layer can be added by reusing the result of MiniMap.

## 0.4.3

### Patch Changes

- 5c76ab93: refactor: redesign upload page

## 0.4.2

### Patch Changes

- adcb288c: fix: redirection of users when all uploads are cancelled

## 0.4.1

### Patch Changes

- 0b1c8380: refactor: use goto in upload button
- 4168257c: fix: update current zoom when map extent is changed in STAC explorer.
- 2b02512c: fix: bug of not updating ingesting dataset count in my data tab in data page
- 29a82ab1: fix: use goto method of sveltekit for go back to previous page button

## 0.4.0

### Minor Changes

- 3afb056a: feat: data upload cancellation
- 9b3ee698: feat: moved some vector legend properties to properties editer popup. Layout of vector legend was changed due to this change.
- 8d453243: feat: added goback to previous page button in other pages
- 2901bfcc: feat: allow superusers to update or delete saved map created by other users.

### Patch Changes

- 9b3ee698: refactor: moved opacity tab to property editor popup
- d7862012: fix: represent selected shapefiles as single file with no extension and show selected files in the files as tags
- 27b4ebe5: fix: Missing file extension error of shapefile
- c2189686: refactor: Use bulma's tab and close icon css for ColorMapPicker, IconImagePicker and DataCardInfoMenu
- 345f57a8: fix: skip updating dataset properties if the dataset feature does not exist at /api/style endpoint
- 58195040: feat: improved the layout of supported format page
- 8d453243: fix: changed endpoint of data/publish to data/{id}/edit

## 0.3.0

### Minor Changes

- 1f7b49f3: feat: add a feature to reverse colormap's colors in ColorMapPicker

## 0.2.0

### Minor Changes

- b57b5563: refactor: upload multiple files cocurrently

### Patch Changes

- fc653cf5: fix: fixed bahaviour of STAC Explorer. Set MaxZoom and MaxBounds in the explorer, and fixed some behaviours when parameters are changed.
  fix: [BREAKING CHANGE]fixed mosaicjson path like https://undpngddlsgeohubdev01.blob.core.windows.net/mosaicjson/microsoft-pc/sentinel-2-l2a/S2A_MSIL2A_20230714T072621_R049_T37MDP_20230714T145720/S2B_MSIL2A_20230907T072619_R049_T37MEP_20230907T152656/mosaicjson.json (microsoft-pc/{collection id}/{...item}/mosaicjson.json)
- 9fa33c72: fix: Use server endpoint if saved style source URL origin is different from current server (for pg_tileserv source).

## 0.1.0

### Minor Changes

- cb008f50: feat: Added multiple files upload
  feat: Added supported formats page"
- d5641601: feat: saving & restoring default layer style for vector datasets
- cfbadc56: feat: show the number of datasets in tabs at data page.
- e989e06b: feat: improved the layout of publish page by introducing tabs.
- 0b3105df: - feat: added CountryPicker in data page
  - fixed several bugs related to country picker in publish page
  - fixed filckering in SDG picker and country picker
- c04f6296: feat: add default layer style editing feature for raster dataset
- 9ec9dc9c: feat: implemented new endpoints (`/api/datasets/{id}/style/{layer}/{type}`) to fetch, register and delete default layer style for a dataset.
- be6815f4: feat: add date filter feature in STAC explorer. New date filter setting is also available in settings page.

### Patch Changes

- adbda0f9: feat: add default style edit page link in data page operation menu
- e391895d: refactor: make sdgPicker component simpler.
- 63817d3f: fix: only show user icon in header
- d6d70f41: doc: add new default style endpoint in swagger (WIP)
- 478f8fc8: fix: now VectorClassifyLegend was added to default layer style edit page
- 406aefd2: feat: moved SDG/region selector component from data page to home page
- dc90f2fb: refactor: use DefaultLink component in data/[id] page
- 6f23518d: fix: fixed bug of resetting SAS token for Microsoft Planetary Computer in saved maplibre style source
- 8479b70d: fix: removed edit page link from dataset operation menu
- 654b9af9: doc: add new table to manage default style for each dataset in ERD.
- 9a24d162: refactor: add open DefaultLink in new tabs
- a6e2781c: fix: selection button not creating selectFile upload bug
- fea98a97: feat: redesigned top contents of home page to be clearer for users. Animation arrow is added to show the home page is scrollable.
- 43354fe0: refactor: minor redesign of upload page
  refactor: minor redesign of supported formats page
- 083b4ed6: fix: avoid accessing $page store inside <svelte:head> in server side. Moved some variables to load function in +layout.server.ts
- 321919ff: fix: add static image api link in footer
- 4982eb35: fix: removed Default legend if the raster layer is unique value type
- 127c7922: feat: migrate rescale slider to raster properties editor popup. Now rescale can work even in raster ClassifyLegend
- e19f1942: fix: add validation of single filenames
- 23285852: fix: removed color map name from colormap picker

## 0.0.3

### Patch Changes

- 6af41390: first changeset version release
