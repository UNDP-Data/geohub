# @undp-data/svelte-undp-design

## 2.0.0

### Major Changes

- 224477a: chore: migrated bulma to v1.0.0. Included fontawesome css and google font icon css in customised bulma css.

## 1.0.8

### Patch Changes

- 387cb02: chore: migrated storybook to v8

## 1.0.7

### Patch Changes

- 6255c69: fix: add icon option to show fa icon next to tag at Card and CardWithImage component

## 1.0.6

### Patch Changes

- 5566f74: fix: add an option of forbiddenCharacters in SearchExpand component. as default, it ignore & and | char.

## 1.0.5

### Patch Changes

- 9e82681: fix: exclude **.stories.** files from NPM packages dist folder

## 1.0.4

### Patch Changes

- e022cb1: fix: added a custom click event for Card component

## 1.0.3

### Patch Changes

- 37da3b1: feat: add Sidebar component in UNDP design

## 1.0.2

### Patch Changes

- f4e646a: fix: show all menu items in UNDP header

## 1.0.1

### Patch Changes

- 3434bd6: fix: fix: there is a conflict of class name 'card' between bulma and undp design, thus changed undp's class name to undp-card. Furthermore, removed border-top's black stripe if no tag is specified on Card and CardWithImage components.
- 790ca7c: fix: previously, we changed logo height to be the same height of header because the logo stuck out affected our sidebar design. But current design can be together with original logo height. Reverted logo height to the original UNDP design header.

## 1.0.0

### Major Changes

- 536f95f: chore: migrated sveletekit from v1 to v2

### Patch Changes

- fc17c92: fix: adjust font size option. now normal is 1rem, small is 0.75rem and medium is 1.5rem.
- a374cfc: fix: Use browser from sveltekit to check window is available

## 0.5.5

### Patch Changes

- 8255e46: fix: changed font color of UNDP header to be the latest version

## 0.5.4

### Patch Changes

- b5dbbfb: fix: CardWidthImage component fixes contains 1) hide content tag if tag is empty string, 2) show ... if title is long name.

## 0.5.3

### Patch Changes

- 9633b7d3: fix: added missing font files and images used in UNDP design css

## 0.5.2

### Patch Changes

- dfb60307: fix: hide content tag in Card if tag variable is empty string

## 0.5.1

### Patch Changes

- 258916e5: fix: Change markdown text in description to HTML in Card

## 0.5.0

### Minor Changes

- 5cd8b92b: feat: add Card component without image

### Patch Changes

- 5cd8b92b: fix: fixed CardWithImage component to just use normal image URL
- 55b641c6: fix: show loader in CardWithImage

## 0.4.5

### Patch Changes

- 5d0c86a0: fix:styles of Breadcrumbs component

## 0.4.4

### Patch Changes

- 626ee6dc: chore: updated dependencies for packages and geohub repo

## 0.4.3

### Patch Changes

- e853fad7: fix: make stat font a bit smaller when size is small
- b2368f16: fix: put some padding between chevron and accordion title

## 0.4.2

### Patch Changes

- cca8098e: fix: export selectedItem in Select component

## 0.4.1

### Patch Changes

- b57b5563: refactor: add disabled option to checkbox

## 0.4.0

### Minor Changes

- cb008f50: feat: Added TextInput component
  refactor: Minor improvement Checkbox styling
- 935627b1: feat: added Select component in svelte UNDP design
- 43354fe0: feat: added `DefaultLink` component
- 9a24d162: refactor: add open DefaultLink in new tabs
- 0b3105df: feat: add MultiSelect component

### Patch Changes

- 406aefd2: fix: set preload-data and preload-code to off in CtaLink

## 0.3.5

### Patch Changes

- b3f4b7ac: fix: changed a tag to div element on Pagination component because svelte complains it does not use any href
- 133003f5: fix: changed a tag which does not have href to div in Breadcrumbs component

## 0.3.4

### Patch Changes

- 370fc268: Added sveltekit's link options to header

## 0.3.3

### Patch Changes

- 8a2176a0: fix: add files in package.json

## 0.3.2

### Patch Changes

- 8f41e176: fix: add browser variable check in UNDP header

## 0.3.1

### Patch Changes

- 83ab82c4: feat: add 'disabled' and 'loading' options in SearchExpand

## 0.3.0

### Minor Changes

- c8ca7dc9: feat: add SearchExpand component in svelte-undp-design

### Patch Changes

- c8ca7dc9: pnpm update

## 0.2.13

### Patch Changes

- 93a3c4cf: feat: add target property for CtaLink component

## 0.2.12

### Patch Changes

- aa35d98b: fix: use href in download component
- aa35d98b: fix: enabled a href for ctalink component.

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
