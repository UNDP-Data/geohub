# @undp-data/svelte-undp-design

## 0.2.11

### Patch Changes

- 0a18ffed: fix: export "showMobileMenu" variable in UNDP header
- 0a18ffed: fix: added preload data and code options in header and footer item in UNDP design
- 0a18ffed: fix: added data-sveltekit-preload in a tag
- 97f3b1f1: - fix: added callback option in Footer
  - feat: added FooterItem interface for Footer
  - fix: use `document.location` in CtaLink

## 0.2.10

### Patch Changes

- ebf99d86: fix: changed FluidCarousel and CtaLink to use a tag's href for link
- ebf99d86: fix: changed header menu's click event to a tag's href since beforeNavigate event of sveltekit is not triggered

## 0.2.9

### Patch Changes

- 2ebf4637: fix: delete tooltip from UNDP header menu

## 0.2.8

### Patch Changes

- 1c8995fe: fix: changed href of a tag to on:click event to open the link in FluidCarousel component
- 65fcbf0e: chore: pnpm update

## 0.2.7

### Patch Changes

- 5328020d: fix: make menu hidden if current URL path name is the same.

## 0.2.6

### Patch Changes

- bf26a456: chore: pnpm update -r to update npm packages
- 507fe3e6: fix: updated UNDP header's CSS and HTML
- f0c5f16e: fix: Use document.location instead of href property of a tag since there is a problem of page initialisation in sveltekit
- 491066a2: fix: removed icon from UNDP header.
- bf26a456: chore: updated npm packages in svelte-undp-design except vitest and sveltejs/package

## 0.2.5

### Patch Changes

- 27d95d3e: fix: custom-button HTML to avoid creating two elements

## 0.2.4

### Patch Changes

- 68bc4a96: chore: migrated maplibre to v3

## 0.2.3

### Patch Changes

- 9328b703: chore: migrated svelte3 to svelte4 with newer lint and prettier

## 0.2.2

### Patch Changes

- c8f5b2f1: chore: updated all npm packages except maplibre-gl

## 0.2.1

### Patch Changes

- a98475b0: fix: margin of menu-item in undp header

## 0.2.0

### Minor Changes

- 3d796365: - imporoved storybook documentation
  - added vitests for most components

## 0.1.4

### Patch Changes

- 338f03c7: feat: add disabled option and flag-icon feature in breadcrumb component
- 8209613d: update Breadcrumbs.stories.ts

## 0.1.3

### Patch Changes

- e84c0e2f: fix: bug of undp radios

## 0.1.2

### Patch Changes

- 421c883f: feature: added 'change' event in Radio button control

## 0.1.1

### Patch Changes

- 342bcf3: refactor: added interfaces in index.ts to be exported

## 0.1.0

### Minor Changes

- 8ca24d8: chore: updated svelte-package to v2

### Patch Changes

- 66b2886: update dependencies

## 0.0.16

### Patch Changes

- c060dd9: update storybook version
- 4230281: fixed bug of Download componenent. Also, deleted storybook from GeoHub's static folder

## 0.0.15

### Patch Changes

- 7d37599: Add `x-small` option to loader

## 0.0.14

### Patch Changes

- b066709: Add width style to ensure that the accordions are aligned at the same level

## 0.0.13

### Patch Changes

- e83a97b: Add size option for Header
- e83a97b: Add more options for progress bar size
- e83a97b: Changed Size of loader in header

## 0.0.12

### Patch Changes

- 7fc0cc7: added Stats component in undp design system

## 0.0.11

### Patch Changes

- 321b5a0: set height variable of Tabs as optional parameter

## 0.0.10

### Patch Changes

- fd21cd2: - fix: show xmark button when hamburger button is clicked in header
  - fix: enable expanding footer items in mobile

## 0.0.9

### Patch Changes

- 96ea065: fix: set logo height as the same with header height

## 0.0.8

### Patch Changes

- 77a8dac: feat: added headerIcon property in accordion header

## 0.0.7

### Patch Changes

- 5c98d25: feat: redesigned UNDP header design to adopt responsive menu

## 0.0.6

### Patch Changes

- 310179a: added Download component in svelte-undp-design

## 0.0.5

### Patch Changes

- f94ccdc: revert changes to use prepack

## 0.0.4

### Patch Changes

- 58055ac: removed prepare script from packages
- ba30a62: add prepack and postpack script to move package folder before publishing and back to original folder after publishing

## 0.0.3

### Patch Changes

- a95fdb0: pnpm udate
- a95fdb0: moved svelte module from devDependencies to peerDependencies

## 0.0.2

### Patch Changes

- 15131ee: Aligned arrow key in accordion to the accordion text
- 65954a1: prettier to format package
