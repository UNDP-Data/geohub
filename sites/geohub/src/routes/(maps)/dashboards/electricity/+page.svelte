<script lang="ts">
	import { MapStyles } from '$lib/config/AppConfig';
	import ElectricityDashboard from './ElectricityDashboard.svelte';

	let title = 'GeoHub | Electricity Dashboard';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
</svelte:head>

<ElectricityDashboard styles={MapStyles} />
