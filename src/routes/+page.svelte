<script lang="ts">
  import Header from '$components/Header.svelte'
  import Content from '$components/Content.svelte'
  import Map from '$components/Map.svelte'

  let drawerOpen = true
</script>

<Header bind:drawerOpen />
<Content bind:drawerOpen>
  <Map />
</Content>

<style
  global
  lang="scss">
  @import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';

  body,
  html {
    font-family: ProximaNova, sans-serif;
    font-size: 13px;
  }
</style>
