---
"geohub": patch
---

refactor: Moved logic of layer style creation from client to server side endpoints

- basically moved the logic of layer creation from RasterTileData and VectorTileData to the endpoint of `/api/datasets/{id}/style/{{layer}/{type}`
- for STAC COG Item, `/stac/style/[type]/[colleciton]/[...item]/[asset]` was added to compute layer style
- merged MosaicJsonData class to RasterDefaultStyleClass and RasterTileData
- previously, layer style was created repeatedly without reusing preview data in MiniMap component, now layer can be added by reusing the result of MiniMap.
