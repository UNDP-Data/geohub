# @undp-data/svelte-undp-components

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
