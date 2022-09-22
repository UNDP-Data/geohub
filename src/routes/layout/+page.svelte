<script lang="ts">
  import { style } from 'svelte-body'
  import Header_UNDP from '$components/UNDPComponents/Header_UNDP.svelte'
  import Content_UNDP from '$components/UNDPComponents/Content_UNDP.svelte'
  import Map from '../../components/Map.svelte'

  let drawerOpen = true
</script>

<svelte:body use:style={{ height: '100vh', margin: '0px', padding: '0px', border: '0px solid red' }} />

<Header_UNDP bind:drawerOpen />
<Content_UNDP bind:drawerOpen>
  <Map />
</Content_UNDP>

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
