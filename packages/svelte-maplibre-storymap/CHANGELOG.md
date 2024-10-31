# @undp-data/svelte-maplibre-storymap

## 0.3.25

### Patch Changes

- Updated dependencies [687a354]
  - @undp-data/svelte-undp-components@1.5.3

## 0.3.24

### Patch Changes

- Updated dependencies [c9154b9]
  - @undp-data/svelte-undp-components@1.5.2
  - @undp-data/svelte-undp-design@2.3.4

## 0.3.23

### Patch Changes

- 555b636: fix: add svelte 5 to peer dependencies
- Updated dependencies [555b636]
  - @undp-data/svelte-undp-components@1.5.1
  - @undp-data/svelte-undp-design@2.3.3

## 0.3.22

### Patch Changes

- Updated dependencies [cd7ad93]
- Updated dependencies [9f9e7fb]
  - @undp-data/svelte-undp-components@1.5.0

## 0.3.21

### Patch Changes

- Updated dependencies [a331de4]
  - @undp-data/svelte-undp-components@1.4.0

## 0.3.20

### Patch Changes

- 9f9be6b: fix: fixed bug of restoring layer opacity when there is no paint property.

## 0.3.19

### Patch Changes

- Updated dependencies [6063bbf]
  - @undp-data/svelte-undp-design@2.3.2
  - @undp-data/svelte-undp-components@1.3.2

## 0.3.18

### Patch Changes

- cb7a7d4: fix: removed max-height from storymap slide card content itself, but added max-height for storymap editor preview.

## 0.3.17

### Patch Changes

- 7289107: fix: fixed the layout of header preview with logo in sidebar
- 03573c9: fix: fixed bug of not able to use pagination when storymap header page is shown.

## 0.3.16

### Patch Changes

- 9d91903: chore: updated all dependencies of monorepo by using pnpm -r update.
- Updated dependencies [9d91903]
  - @undp-data/svelte-undp-components@1.3.1
  - @undp-data/svelte-undp-design@2.3.1

## 0.3.15

### Patch Changes

- a21106c: fix: removed margin-bottom from last slide of storymap. enable pointer-events for slide card.

## 0.3.14

### Patch Changes

- bf3b33b: fix: adjusted storymap header style of margin and line-height
- 127029d: fix: apply position:sticky for storymap's map part and show footer after map.

## 0.3.13

### Patch Changes

- 4796cd6: fix: fix behaviour of storymap footer. change map size dynamically if last chapter is shown.

## 0.3.12

### Patch Changes

- c5b0f76: fix: fixed storymap footer style
- Updated dependencies [317f7a3]
- Updated dependencies [ad1b4ad]
- Updated dependencies [110baf5]
- Updated dependencies [ad1b4ad]
  - @undp-data/svelte-undp-components@1.3.0

## 0.3.11

### Patch Changes

- 262f3b7: fix: add h1 and h2 style for markdown.

## 0.3.10

### Patch Changes

- c5d9637: fix: set max-height to 512px and align left for storymap slide image.
- 86b4ff3: fix: added Footer tab in last slide editor and introduced markdown for footer text.

## 0.3.9

### Patch Changes

- 8929171: fix: set ProximaNova for the font of legend control.

## 0.3.8

### Patch Changes

- 2f13a8b: - fix: #4084 fixed padding when there is no logo in storymap header.
  - fix: #4082 removed min-height from storymap card.
  - fix: #4085 fixed the link style of storymap card
  - fix: #3992 removed accordion for each layer legend if no interactive mode.
  - fix: adjusted storymap css
  - fix: show loader in legend while data is being loaded.
- 624b222: fix: fixed bug of hiding storymap pagination control when scroll is beyond footer.
- Updated dependencies [2b885fa]
- Updated dependencies [2b885fa]
  - @undp-data/svelte-undp-components@1.2.0
  - @undp-data/svelte-undp-design@2.3.0

## 0.3.7

### Patch Changes

- Updated dependencies [b12b2c0]
  - @undp-data/svelte-undp-components@1.1.1

## 0.3.6

### Patch Changes

- Updated dependencies [5d63d06]
- Updated dependencies [4bca825]
  - @undp-data/svelte-undp-components@1.1.0
  - @undp-data/svelte-undp-design@2.2.3

## 0.3.5

### Patch Changes

- Updated dependencies [d44f128]
- Updated dependencies [d44f128]
  - @undp-data/svelte-undp-design@2.2.2
  - @undp-data/svelte-undp-components@1.0.13

## 0.3.4

### Patch Changes

- 47ede98: - fix: fix legendPosition type error.
  - fix: set default width of legend as 384px.

## 0.3.3

### Patch Changes

- 8876903: fix: added new options for legend plugin to hide invisible layers and opacity controls for storymap legend
- ea20c42: fix: fixed bug when there is no chapter in story
- fbc40b5: fix: when users go back to storymap header, restore all style and legend setting to be initial state.
- Updated dependencies [ea20c42]
  - @undp-data/svelte-undp-components@1.0.12

## 0.3.2

### Patch Changes

- Updated dependencies [2165006]
  - @undp-data/svelte-undp-components@1.0.11

## 0.3.1

### Patch Changes

- e877bdc: fix: toggle layout.visibility instead of opacity for hillshade layer since its layer type has not opacity.
- 14e8275: fix: hide opacity slider for hillshade layer
- 07579ae: fix: collapse storymap legend in small screen as default
- 95e1df2: fix: added maplibre-gl-sky to storymap component
- Updated dependencies [f7839e0]
- Updated dependencies [cfbd262]
- Updated dependencies [c6996f8]
  - @undp-data/svelte-undp-components@1.0.10

## 0.3.0

### Minor Changes

- 51596c1: feat: moved MaplibreLegendControl from geohub to the package, and added legend to storymap component.

### Patch Changes

- c2e92d2: fix: fixed css for full alignment
- 3824b02: fix: added margin-right for opacity button in OpacityEditor component, and ajusted some css.
- Updated dependencies [a26abdb]
- Updated dependencies [1314773]
- Updated dependencies [3824b02]
- Updated dependencies [20b8c79]
- Updated dependencies [090a33a]
- Updated dependencies [4881141]
  - @undp-data/svelte-undp-components@1.0.9

## 0.2.5

### Patch Changes

- 993ea8a: fix: set max-width as 512px for storymap slide card.

## 0.2.4

### Patch Changes

- e628e5a: fix: progress bar state change for footer position
- Updated dependencies [c2707cd]
  - @undp-data/svelte-undp-components@1.0.8

## 0.2.3

### Patch Changes

- Updated dependencies [ed3bd25]
  - @undp-data/svelte-undp-components@1.0.7

## 0.2.2

### Patch Changes

- @undp-data/svelte-undp-components@1.0.6

## 0.2.1

### Patch Changes

- Updated dependencies [fc873ef]
  - @undp-data/svelte-undp-components@1.0.5

## 0.2.0

### Minor Changes

- 91270f0: feat: added scroll control to storymap component

### Patch Changes

- a3eb5a7: fix: fixed bug of initialization storymap in the plugin
- 71ee5c3: - fix: removed imageAlignment, and added cardHidden prop
  - fix: Rename slide transition.
  - fix: simplify map selector component.
- b0cabdd: fix: add small size of header/footer card
- d1d8af5: fix: improved storymap UI, and separated header and footer to individual svelte component.
- a3c4cf2: fix: export setLayerOpacity method from storymap plugin
- 86a9e57: chore: upgraded marked to v14
- 5a72838: fix: export layerTypes variable from the package
- 3101984: chore: updated eslint to v9
- d3ef8ee: fix: export StorymapHeader and StorymapFooter components.
- f67d00f: fix: fixed layout collapse in responsive for storymap
- 94e985e: fix: fixed bug of setting margin-top of storymap.
- 613aeb1: fix: updated style css to avoid conflicts with bulma.
- 85d0983: fix: add marginTop to storymap component
- 07f3813: fix: fixed css for imageAlignment
- d66e485: fix: added size prop (small or normal) to chapter. small is for mini preview.
- b4e326b: fix: fix bug of StorymapChapter
- 38d2218: fix: fixed a bug of chapter initialization
- d0469f4: fix: fixed responsive design of storymap
- 35d3871: fix: redesigned slide progress bar for storymaps
- Updated dependencies [509e8c7]
- Updated dependencies [9d69976]
- Updated dependencies [07f3813]
- Updated dependencies [07f3813]
- Updated dependencies [3101984]
- Updated dependencies [32961ac]
- Updated dependencies [a3c4cf2]
- Updated dependencies [568668e]
  - @undp-data/svelte-undp-components@1.0.4

## 0.1.3

### Patch Changes

- abbacef: fix: merged markdown css to chapter.scss

## 0.1.2

### Patch Changes

- 3c85a87: fix: align image for chapter either left or center or right

## 0.1.1

### Patch Changes

- 185bff9: feat: added onChapterEnter and onChapterExit to chapter properties.

## 0.1.0

### Minor Changes

- 440dcaf: feat: add a dark template style for storymap to able to switch different template.

## 0.0.5

### Patch Changes

- 7aa9db8: fix: fixed a bug of center alignment
- 7aa9db8: feat: added mapNavigationPosition option in chapter config
- 7aa9db8: fix: add 'pointer-events: none;' to step class, so map navigation works over the chapter content
- 7aa9db8: refactor: created StoryMapChapter component to split from main component.
- 7aa9db8: fix: adjusted CSS for chapter

## 0.0.4

### Patch Changes

- 25d54c1: chore: updated dependencies for storymap plugin

## 0.0.3

### Patch Changes

- 7d3c54c: chore: upgraded to maplibre v4 and pmtiles v3

## 0.0.2

### Patch Changes

- f956bf0: first release of svelte-maplibre-storymap
