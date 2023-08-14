<script lang="ts">
	import { MapStyles } from '$lib/config/AppConfig';
	import ElectricityDashboard from './ElectricityDashboard.svelte';

	let title = 'Electricity Dashboard | GeoHub';
	let content = 'Electricity dashboard';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="/api/og?content={content}" />
</svelte:head>

<ElectricityDashboard styles={MapStyles} />
