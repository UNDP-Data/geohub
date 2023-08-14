<script lang="ts">
	import { MapStyles } from '$lib/config/AppConfig';
	import Content from './components/Content.svelte';
	import Map from './components/Map.svelte';

	let loadLayers = () => {
		return;
	};

	let styles = MapStyles;

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

<Content bind:loadLayers>
	<Map on:styleChanged={loadLayers} bind:styles />
</Content>
