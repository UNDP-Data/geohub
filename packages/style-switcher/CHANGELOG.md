# @undp-data/style-switcher

## 1.0.0

### Major Changes

- 1175a321: feat: [breaking changes] rewrote style switcher plugin from svelte to normal vanialla JS. New style switcher control now supports more than two style, and use image URL instead of creating maplibre map object.
- 1175a321: feat: [breaking change] Use static image api for preview image of map button other than using maplibre map object

## 0.1.10

### Patch Changes

- 626ee6dc: chore: updated dependencies for packages and geohub repo

## 0.1.9

### Patch Changes

- 8a2176a0: fix: add files in package.json

## 0.1.8

### Patch Changes

- 6bd9322a: fix: fixed a bug of style switching when default style is bing aerial

## 0.1.7

### Patch Changes

- c111d12c: feat: add 'defaultStyle' parameter in StyleSwitcher

## 0.1.6

### Patch Changes

- a2fb2c42: fix: restore current selected map state to style switcher button

## 0.1.5

### Patch Changes

- 65fcbf0e: chore: pnpm update

## 0.1.4

### Patch Changes

- bf26a456: chore: pnpm update -r to update npm packages
- bb478d8b: fix: changed control css name from 'mapboxgl-ctrl' to 'maplibregl-ctrl'

## 0.1.3

### Patch Changes

- 68bc4a96: chore: migrated maplibre to v3

## 0.1.2

### Patch Changes

- 9328b703: chore: migrated svelte3 to svelte4 with newer lint and prettier

## 0.1.1

### Patch Changes

- c8f5b2f1: chore: updated all npm packages except maplibre-gl

## 0.1.0

### Minor Changes

- 8ca24d8: chore: updated svelte-package to v2

## 0.0.4

### Patch Changes

- f94ccdc: revert changes to use prepack

## 0.0.3

### Patch Changes

- 58055ac: removed prepare script from packages
- ba30a62: add prepack and postpack script to move package folder before publishing and back to original folder after publishing

## 0.0.2

### Patch Changes

- a95fdb0: pnpm udate
- a95fdb0: moved svelte module from devDependencies to peerDependencies
