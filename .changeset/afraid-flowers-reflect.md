---
"@undp-data/svelte-undp-components": patch
"geohub": patch
---

- refactor: migrated some components from geohub to svelte-undp-components
  - LinePatter
  - RasterResampling
  - IconImage
  - IconOffset
  - IconOverlap
  - SymbolPlacement
  - TextFont
  - TextHaloColor
  - TextHaloWidth
  - TextMaxWidth
  - TextSize
- refactor: merged LineWidth to VectorLine
- reafctor: merged TextColor to VectorLabelPanel
- fix: removed type from LineTypes
- fix: fixed bug of not updating sas token for PMTiles URL in saved style.
- refactor: merged all vector sub components into VectorLegend to simplify
- refactor: merged RasterLegendEdit to RasterLegend to simplify
- refactor: renamed original IconImage to IconImageSelector since it has conflict with new IconImage
