<script lang="ts">
  import { style } from 'svelte-body'
  import { ElectricityDashboard } from '@undp-data/electricity-dashboard'
  import { styles } from '$lib/constants'
</script>

<svelte:head>
  <title>GeoHub | Electricity Dashboard</title>
</svelte:head>

<svelte:body use:style={{ height: '100vh', margin: '0px', padding: '0px', border: '0px solid red' }} />

<ElectricityDashboard {styles} />
