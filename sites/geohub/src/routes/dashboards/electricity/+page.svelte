<script lang="ts">
  import { MapStyles } from '$lib/AppConfig'
  import { ElectricityDashboard } from '@undp-data/electricity-dashboard'

  let title = 'GeoHub | Electricity Dashboard'
</script>

<svelte:head>
  <title>{title}</title>
  <meta
    property="og:site_name"
    content={title} />
  <meta
    property="og:title"
    content={title} />

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

<ElectricityDashboard styles={MapStyles} />
