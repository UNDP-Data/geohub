<script lang="ts">
	import { MapStyles } from '$lib/config/AppConfig';
	import Content from './components/Content.svelte';
	import Map from './components/Map.svelte';

	let loadLayers = () => {
		return;
	};

	let styles = MapStyles;

	let title = 'GeoHub | Electricity Dashboard';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
</svelte:head>

<Content bind:loadLayers>
	<Map on:styleChanged={loadLayers} bind:styles />
</Content>
