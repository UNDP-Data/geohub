<script lang="ts">
  import { SvelteToast } from '@zerodevx/svelte-toast'
</script>

<slot />

<SvelteToast />

<style
  global
  lang="scss">
  @import '@undp-data/undp-bulma/bulma.scss';
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
  @import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
  @import 'bulma-switch/dist/css/bulma-switch.min.css';
  @import 'bulma-divider/dist/css/bulma-divider.min.css';
</style>
