<script lang="ts">
  import { style } from 'svelte-body'
  import Header from '../dashboards//components/Header.svelte'
  import Content from '../dashboards/components/Content.svelte'
  import Map from '../dashboards/components/Map.svelte'

  let drawerOpen = true
</script>

<svelte:body use:style={{ height: '100vh', margin: '0px', padding: '0px', border: '0px solid red' }} />

<Header bind:drawerOpen>
  <slot />
</Header>

<Content bind:drawerOpen>
  <Map />
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
