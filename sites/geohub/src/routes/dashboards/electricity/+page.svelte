<script lang="ts">
  import { ElectricityDashboard } from '@undp-data/electricity-dashboard'
  import { styles } from '$lib/constants'
</script>

<svelte:head>
  <title>GeoHub | Electricity Dashboard</title>

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

<ElectricityDashboard {styles} />
