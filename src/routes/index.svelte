<script lang="ts">
  import { style } from 'svelte-body'

  import Content from '$components/Content.svelte'
  import Header from '$components/Header.svelte'
  import Map from '$components/Map.svelte'
  import { BucketIntialValues } from '$lib/constants'
  import type { Bucket } from '$lib/types'
  import { bucketList } from '$stores'

  let drawerOpen = true
  let panelOpen = false

  export let buckets = [BucketIntialValues as Bucket]
  $bucketList = buckets
</script>

<svelte:body use:style={{ height: '100vh', margin: '0px', padding: '0px', border: '0px solid red' }} />

<Header bind:drawerOpen bind:panelOpen />

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
