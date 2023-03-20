# @undp-data/undp-bulma

This repository is to manage customised [Bulma](https://bulma.io/documentation/) style for [UNDP design](https://design.undp.org/).

Customised primary color (`$primary`) and secondary color (`$link`) for UNDP design.

Use the following class name for your Bulma.

For example, for button,

```html
<button class="button is-primary">Primary color Button</button>

<button class="button is-link">Secondary color Button</button>
```

## Installation

```bash
npm install -D bulma @undp-data/undp-bulma
```

## Usage

### Import CSS

```ts
import "@undp-data/undp-bulma/style.css";
```

### Import SCSS

```svelte
<style lang="scss">
    @import '@undp-data/undp-bulma/bulma.scss';
</style>
```
