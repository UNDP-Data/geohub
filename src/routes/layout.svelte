<script lang="ts">
  import { style } from 'svelte-body'
  import Header from '../components/Header.svelte'
  import Content from '../components/Content.svelte'
  import Map from '../components/Map.svelte'

  let drawerOpen = true
  let panelOpen = false
</script>

<svelte:body use:style={{ height: '100vh', margin: '0px', padding: '0px', border: '0px solid red' }} />

<Header bind:drawerOpen bind:panelOpen />
<Content bind:drawerOpen>
  <Map />
</Content>

<slot />

<style global lang="scss">
  @import 'src/styles/undp-design/fonts';
  body,
  html {
    font-family: ProximaNova, sans-serif;
    font-size: 13px;
  }
  .mdc-drawer {
    width: 355px;
  }

  .mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing) + .mdc-drawer-app-content {
    margin-left: 355px;
    margin-right: 0;
  }
</style>
