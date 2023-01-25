<script lang="ts">
  import MainApp from '$components/MainApp.svelte'
</script>

<svelte:head>
  <title>GeoHub | United Nations Development Programme</title>
</svelte:head>

<MainApp />

<style
  global
  lang="scss">
  @import 'src/styles/geohubstyle.scss';
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
