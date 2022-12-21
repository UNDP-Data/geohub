<script lang="ts">
  import Header from '$components/Header.svelte'
  import Content from '$components/Content.svelte'
  import Map from '$components/Map.svelte'

  let drawerOpen = true
  let headerHeight: number
</script>

<svelte:head>
  <title>GeoHub | United Nations Development Programme</title>
</svelte:head>

<Header
  bind:drawerOpen
  bind:height={headerHeight} />
<Content
  bind:drawerOpen
  bind:headerHeight>
  <Map />
</Content>

<style
  global
  lang="scss">
  @import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
  @import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
  @import 'bulma-switch/dist/css/bulma-switch.min.css';
  @import 'bulma-divider/dist/css/bulma-divider.min.css';

  body,
  html {
    font-family: ProximaNova, sans-serif;
    font-size: 13px;
  }
</style>
