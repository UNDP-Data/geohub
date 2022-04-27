<script context="module">
  export async function load({ fetch }) {
    const resBuckets = await fetch('azbuckets.json')
    const buckets = await resBuckets.json()

    return {
      props: {
        buckets,
      },
    }
  }
</script>

<script lang="ts">
  import { bucketList } from '$stores'
  import { BucketIntialValues } from '$lib/constants'
  import type { Bucket } from '$lib/types'
  import { style } from 'svelte-body'
  import Header from '../components/Header.svelte'
  import Content from '../components/Content.svelte'
  import Map from '../components/Map.svelte'

  let drawerOpen = true
  let panelOpen = false

  export let buckets = [BucketIntialValues as Bucket]
  bucketList.set(buckets)
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