<script lang="ts">
  import { style } from 'svelte-body'
  import Content from '../../../dashboards/components/Content.svelte'
  import Map from '../../../dashboards/components/Map.svelte'
  let drawerOpen = true
  let loadLayers = () => {
    return
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="../smui.css" media="(prefers-color-scheme: light)" />
  <link rel="stylesheet" href="../smui-dark.css" media="screen and (prefers-color-scheme: dark)" />
</svelte:head>
<svelte:body use:style={{ height: '100vh', margin: '0px', padding: '0px', border: '0px solid red' }} />

<Content bind:drawerOpen bind:loadLayers>
  <Map on:styleChanged={loadLayers} />
</Content>

<style global lang="scss">
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
