# @undp-data/svelte-undp-components

## 2.2.0

### Minor Changes

- dc18d73: feat: add HillshadeMethod component for hillshade layer.

## 2.1.1

### Patch Changes

- 64e9bfb: fix: hide color map picker if raster dataset is unique value and has default colormap
- 64e9bfb: fix: add colormap property to RasterTileMetadata interface.

## 2.1.0

### Minor Changes

- 5b07661: feat: upgrade storybook from v8 to v9

### Patch Changes

- 26eded2: fix: upgrade svelte-range-slider-pips to v4
- Updated dependencies [5b07661]
  - @undp-data/svelte-undp-design@3.1.0

## 2.0.12

### Patch Changes

- 7423675: fix: add rows proprety to CopyToClipboard component to set the number of rows if multiline mode.

## 2.0.11

### Patch Changes

- 2e76a72: fix: set debounce for textbox of NumberInput component to allow users manually change value correctly.

## 2.0.10

### Patch Changes

- 2d81062: chore: updated dependencies
- Updated dependencies [2d81062]
  - @undp-data/svelte-undp-design@3.0.6

## 2.0.9

### Patch Changes

- 1ed3137: fix: remove $bindable from toggled property of Switch component in UNDP Design System because of some issue of reactivity in svelte 5. Use onchange event instead.
- 27fa5fa: fix: show accordion and floating panel titile correctly if title contains dot (.)
- Updated dependencies [1ed3137]
  - @undp-data/svelte-undp-design@3.0.5

## 2.0.8

### Patch Changes

- d2bb101: fix: fixed lint error for eslint-plugin-svelte v3 changes.
- Updated dependencies [d2bb101]
  - @undp-data/svelte-undp-design@3.0.4

## 2.0.7

### Patch Changes

- 678bcec: refactor: moved ImageUploader to svelte-undp-components

## 2.0.6

### Patch Changes

- Updated dependencies [621bd48]
  - @undp-data/svelte-undp-design@3.0.3

## 2.0.5

### Patch Changes

- 28b87b3: chore: updated dependencies
- Updated dependencies [28b87b3]
  - @undp-data/svelte-undp-design@3.0.2

## 2.0.4

### Patch Changes

- f70c8af: fix: fixed too much reactivity caused by binding props in Slider and RasterRescale components.

## 2.0.3

### Patch Changes

- 6092700: fix: revert @undp-data/date-picker-svelte to v2.12.1 since it has reference error in geohub

## 2.0.2

### Patch Changes

- 0a235fa: fix: remove moduleResolution = nodenext from tsconfig.json
- Updated dependencies [0a235fa]
  - @undp-data/svelte-undp-design@3.0.1

## 2.0.1

### Patch Changes

- 125fffd: fix: fixed bug of showing undefined error in VectorSimulation

## 2.0.0

### Major Changes

- 6befcd4: feat: migrate components to svelte 5 (breaking change)

### Patch Changes

- 26440c9: fix: fixed interface where using svelte-undp-design
- 2ee1359: chore: updated date-picker-svelte version
- Updated dependencies [26440c9]
  - @undp-data/svelte-undp-design@3.0.0

## 1.5.19

### Patch Changes

- Updated dependencies [0ae54db]
  - @undp-data/svelte-undp-design@2.4.8

## 1.5.18

### Patch Changes

- 1ac4d94: chore: updated monorepo package dependencies
- 905236f: fix: export defaultHaloWidth from TextHaloWidth component
- a038e3d: chore: upgrade maplibre to v5
- 8e7812f: fix: changed <p> to <div> in FieldControl to wrap slot.
- a2662a7: fix: switched vitePreprocess to sveltePreprocess becauseb of svelte-package hang
- Updated dependencies [1ac4d94]
- Updated dependencies [a2662a7]
  - @undp-data/svelte-undp-design@2.4.7

## 1.5.17

### Patch Changes

- Updated dependencies [2494e91]
  - @undp-data/svelte-undp-design@2.4.6

## 1.5.16

### Patch Changes

- d98a8c3: fix: add href prop for Button in svelte-undp-design, and it uses href prop in a element instead of click event.
- Updated dependencies [d98a8c3]
- Updated dependencies [29f1785]
- Updated dependencies [d98a8c3]
- Updated dependencies [1900ed3]
  - @undp-data/svelte-undp-design@2.4.5

## 1.5.15

### Patch Changes

- 84e2d1e: fix: adjusted HeroLink padding
- Updated dependencies [84e2d1e]
- Updated dependencies [84e2d1e]
  - @undp-data/svelte-undp-design@2.4.4

## 1.5.14

### Patch Changes

- eff67e6: refactor: migrated RasterClassifyLegend and RasterRescale (and related funcitons and interfaces) to svelte-undp-components
- 33d825b: refactor: migrated RasterAlgorithms to svelte-undp-components
- Updated dependencies [404d7fa]
  - @undp-data/svelte-undp-design@2.4.3

## 1.5.13

### Patch Changes

- Updated dependencies [caf4859]
  - @undp-data/svelte-undp-design@2.4.2

## 1.5.12

### Patch Changes

- Updated dependencies [9305ef8]
  - @undp-data/svelte-undp-design@2.4.1

## 1.5.11

### Patch Changes

- Updated dependencies [8054783]
  - @undp-data/svelte-undp-design@2.4.0

## 1.5.10

### Patch Changes

- 3d12870: refactor: migrated VectorParamsPanel from GeoHub to svelte-undp-components
- 8e19b92: fix: fixed bug of default style editor for vector dataset.
- 3d12870: fix: fixed IconSize and getIntervalList (jenks) bug
- 3d12870: refactor: migrated VectorColorClassification from GeoHub to svelte-undp-components
- 55d7ef2: fix: sometimes there might be same values in array. remove duplicated values from intervalList.

## 1.5.9

### Patch Changes

- 32c6a85: fix: downgraded @undp-data/date-picker-svelte to 2.12.1 since geohub is still svelte 4, and it has issue of using svelte 5 component

## 1.5.8

### Patch Changes

- d1f8bd8: refactor: migrated VectorValueClassificaiton component and related util funcitons and sub components.
- 154e218: fix: fixed bug of IconSize not being updated when icon-image is changed

## 1.5.7

### Patch Changes

- 1ee0033: fix: add property of padding in accordion component.
- 1ee0033: fix: adjust padding of ModalTemplate for responsive

## 1.5.6

### Patch Changes

- 2bcd438: fix: add new argument to check extensions of url optionally in isValidUrl.

## 1.5.5

### Patch Changes

- fbb62ae: - refactor: migrated some components from geohub to svelte-undp-components
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
  - TextFieldDecimalPoisition
  - refactor: merged LineWidth to VectorLine
  - reafctor: merged TextColor to VectorLabelPanel
  - fix: removed type from LineTypes
  - fix: fixed bug of not updating sas token for PMTiles URL in saved style.
  - refactor: merged all vector sub components into VectorLegend to simplify
  - refactor: merged RasterLegendEdit to RasterLegend to simplify
  - refactor: renamed original IconImage to IconImageSelector since it has conflict with new IconImage

## 1.5.4

### Patch Changes

- f558459: refactor: migrated CircleStrokeColor to svelte-undp-components
- 1adfc5d: refactor: migrated HeatmapColor to svelte-undp-components
- 40b45c3: refactor: migrated most of maplibre slider components to svelte-undp-components
- 1adfc5d: refactor: migrated FillOutlineColor to svelte-undp-components
- f558459: refactor: migrated ColorPicker to svelte-undp-components
- f558459: refactor: migrated MaplibreColorPicker to svelte-undp-components
- 3afb4b5: refactor: migrated PropertySelect and FillExtrusionHeight components to svelte-undp-components
- f558459: refactor: migrated CircleStrokeWidth from geohub to svelte-undp-components
- a9c3988: refactor: moved CircleRadius to svelte-undp-components and restructured component folder.

## 1.5.3

### Patch Changes

- 687a354: fix: fixed the way of selecting text when input element is focused.

## 1.5.2

### Patch Changes

- c9154b9: fix: move sveltekit and svelte from dependencies to devDependencies.
- Updated dependencies [c9154b9]
  - @undp-data/svelte-undp-design@2.3.4

## 1.5.1

### Patch Changes

- 555b636: fix: add svelte 5 to peer dependencies
- Updated dependencies [555b636]
  - @undp-data/svelte-undp-design@2.3.3

## 1.5.0

### Minor Changes

- cd7ad93: feat: moved CopyToClipboard component to svelte-undp-components from a monorepo package.
- 9f9e7fb: feat: added @undp-data/svelte-sidebar to svelte-undp-components.

## 1.4.0

### Minor Changes

- a331de4: feat: add Histogram component.

## 1.3.2

### Patch Changes

- Updated dependencies [6063bbf]
  - @undp-data/svelte-undp-design@2.3.2

## 1.3.1

### Patch Changes

- 9d91903: chore: updated all dependencies of monorepo by using pnpm -r update.
- Updated dependencies [9d91903]
  - @undp-data/svelte-undp-design@2.3.1

## 1.3.0

### Minor Changes

- 110baf5: feat: added TagSelector component. fixed CountrySelector to filter by continents and regions

### Patch Changes

- 317f7a3: fix: fixed bug of SDGSelector and CountrySelector
- ad1b4ad: fix: added single select mode and new tag mode for TagSelector.
- ad1b4ad: fix: added an option to hide slected tags and countries in the components.

## 1.2.0

### Minor Changes

- 2b885fa: feat: added CountrySelector component

### Patch Changes

- Updated dependencies [2b885fa]
  - @undp-data/svelte-undp-design@2.3.0

## 1.1.1

### Patch Changes

- b12b2c0: fix: fixed bug of SDGSelector.

## 1.1.0

### Minor Changes

- 5d63d06: feat: added SDGSelector component in svelte-undp-component package.

### Patch Changes

- 4bca825: fix: load undp-bulma from NPM instead of CDN
- Updated dependencies [4bca825]
  - @undp-data/svelte-undp-design@2.2.3

## 1.0.13

### Patch Changes

- d44f128: refactor: moved button from HeroHeader component to a MenuButton component.
- Updated dependencies [d44f128]
  - @undp-data/svelte-undp-design@2.2.2

## 1.0.12

### Patch Changes

- ea20c42: fix: added isUppercase option for Accordion component.

## 1.0.11

### Patch Changes

- 2165006: fix: set default cursor for ModalTemplate instead of pointer all the time.

## 1.0.10

### Patch Changes

- f7839e0: refactor: moved IconImage component from geohub to svelte-undp-components
- cfbd262: fix: added tabChanged event for HeroHeader component
- c6996f8: fix: fixed padding for close button of FloatingPanel.

## 1.0.9

### Patch Changes

- a26abdb: fix: adjusted padding of ModalTemplate
- 1314773: - fix: moved OpacityEditor from geohub to svelte-undp-components package
  - fix: added showClose prop in FloatingPanel component.
- 3824b02: fix: added margin-right for opacity button in OpacityEditor component, and ajusted some css.
- 20b8c79: fix: changed order of buttons in ModalNotification. Bring cancel button after continue.
- 090a33a: fix: changed cancel button style for ModalNotification to align with UNDP style
- 4881141: fix: changed slide color to blue-300 of UNDP design system.

## 1.0.8

### Patch Changes

- c2707cd: fix: changed fontawesome to material icon for Help component.
- Updated dependencies [a4eecd6]
  - @undp-data/svelte-undp-design@2.2.1

## 1.0.7

### Patch Changes

- ed3bd25: - fix: add showIcon prop to Notification component
  - fix: hide icon as default for ModalNotification component. Also, changed button color.

## 1.0.6

### Patch Changes

- Updated dependencies [052c7cb]
- Updated dependencies [052c7cb]
  - @undp-data/svelte-undp-design@2.2.0

## 1.0.5

### Patch Changes

- fc873ef: fix: replaced bulma-switch to UNDP Switch control for PropertyEditor
- Updated dependencies [fc873ef]
  - @undp-data/svelte-undp-design@2.1.0

## 1.0.4

### Patch Changes

- 509e8c7: fix: use h5 of undp-bulma for ModalTemplate title
- 9d69976: fix: changed active color of segment button to black. added new prop to change active color.
- 07f3813: fix: headerHeight variable is exported from FloatingPanel component.
- 07f3813: fix: add showExpand prop to hide expand button for FloatingPanel component
- 3101984: chore: updated eslint to v9
- 32961ac: fix: accept string[]/number[] for segmentbutton
- a3c4cf2: fix: prevent closing if showClose is false for ModalTemplate
- 568668e: fix: add width prop for ModalTemplate component

## 1.0.3

### Patch Changes

- 9f445bd: feat: add new prop of subButtons to show a dropdown menu in the header button

## 1.0.2

### Patch Changes

- 685729f: fix: applied SohneBreit and other formats of UNDP design for HeroHeader component.

## 1.0.1

### Patch Changes

- 0c7d0a8: fix: add breadcrumbClicked event in HeroHeader component

## 1.0.0

### Major Changes

- 224477a: chore: migrated bulma to v1.0.0. Included fontawesome css and google font icon css in customised bulma css.

## 0.4.1

### Patch Changes

- ac9ea9e: feat: add formatter option to Slider and PropertyEditor components

## 0.4.0

### Minor Changes

- 4db6d2e: feat: add Slider component

### Patch Changes

- c8ffb4c: fix: add range property for Slider
- 7c8d20f: fix: allow to input float value and negative value manually at NumberInput component
- c8ffb4c: fix: add prefix property for Slider
- c8ffb4c: fix: set height for number input of slider component
- c8ffb4c: fix: add suffix property for Slider
- c8ffb4c: fix: add pips property for Slider

## 0.3.1

### Patch Changes

- 05ac13e: fix: added more options of capitalized, uppercase and fontweight for segmentbuttons component

## 0.3.0

### Minor Changes

- e853c8c: feat: add DatePicker component.

## 0.2.2

### Patch Changes

- 916877a: fix: add click event for breadcrumbs component if url property is not provided.

## 0.2.1

### Patch Changes

- ecdf2b9: fix: show colormap legend in fullwidth for color card in colormap picker

## 0.2.0

### Minor Changes

- ca0a97d: feat: add PropertyEditor component
- 917ca61: feat: add ColorMapPicker component

### Patch Changes

- a61802c: fix: set href as null instead of empty string if tab id is not starting with hash

## 0.1.3

### Patch Changes

- 387cb02: chore: migrated storybook to v8

## 0.1.2

### Patch Changes

- bc616e0: fix: close ModalTemplate by espace key if close button is shown in dialog.

## 0.1.1

### Patch Changes

- 6b7907a: fix: add fontWeight prop to FieldControl

## 0.1.0

### Minor Changes

- 3b648ee: feat: added HeroHeader component

## 0.0.2

### Patch Changes

- 9823d43: feat: added ModalTemplate component
- ef2ede6: feat: added PanelButton component
- 9823d43: feat: added ModalNotification component
- feaf9c7: feat: added ShowDetails component
- e5b1f0f: feat: added BackToTop component
- c29cd12: feat: added FieldControl component
- 4f0dc31: feat: added FloatingPanel component
- d6f0127: feat: added SegmentButtons component
- 891db41: feat: added HeroLink component
- dd20b69: feat: added Breadcrumbs component
- bd2d1d4: refactor: moved Help component and initTippy & initTooltipTippy to svelte-undp-components package
- 3091d04: feat: added Accordion component and clean method
- 155ec0c: feat: added Tabs component
