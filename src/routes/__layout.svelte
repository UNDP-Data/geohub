<script lang="ts">
  import Header from '../components/Header.svelte'
  import Content from '../components/Content.svelte'
  import Map from '../components/Map.svelte'

  let drawerOpen = true
  let panelOpen = false
  import { style } from 'svelte-body'
</script>

<svelte:body use:style={{ height: '100vh', margin: '0px', padding: '0px', border: '0px solid red' }} />

<Header bind:drawerOpen bind:panelOpen />

<Content bind:open={drawerOpen}>
  <Map />
</Content>

<slot />
