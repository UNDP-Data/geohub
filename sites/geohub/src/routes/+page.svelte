<script lang="ts">
  import MainApp from '$components/MainApp.svelte'
</script>

<svelte:head>
  <style type="text/css">
    html,
    body {
      margin: 0;
      padding: 0;
      min-height: 100vh;
      /* mobile viewport bug fix */
      min-height: -webkit-fill-available;
    }

    html {
      overflow-y: hidden !important;
      height: -webkit-fill-available;
    }
  </style>
</svelte:head>

<MainApp />

<style
  global
  lang="scss">
  @import '../styles/geohubstyle.scss';
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
