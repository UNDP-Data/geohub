<script lang="ts">
  import { style } from 'svelte-body'

  // Fixme: Start of new redesign components
  import Header_UNDP from '$components/UNDPComponents/Header_UNDP.svelte'
  import Content_UNDP from '$components/UNDPComponents/Content_UNDP.svelte'
  //Fixme: End of new redesign components

  import Map from '$components/Map.svelte'
  import type { PageData } from './$types'
  import { bucketList } from '$stores'

  let drawerOpen = true

  export let data: PageData
  $bucketList = data.buckets
</script>

<svelte:body use:style={{ height: '100vh', margin: '0px', padding: '0px', border: '0px solid red' }} />

<Header_UNDP bind:drawerOpen />
<Content_UNDP bind:drawerOpen>
  <Map />
</Content_UNDP>

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
