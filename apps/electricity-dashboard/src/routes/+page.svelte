<script lang="ts">
	import { style } from 'svelte-body';
	import type { StyleDefinition } from '@undp-data/style-switcher';
	import { ElectricityDashboard } from '$lib';

	let styles: StyleDefinition[] = [
		{
			title: 'Carto',
			uri: 'https://undp-data.github.io/style/style.json'
		},
		{
			title: 'Bing Aerial',
			uri: 'https://undp-data.github.io/style/aerialstyle.json'
		}
	];
</script>

<svelte:head>
	<title>GeoHub | Electricity Dashboard</title>
</svelte:head>

<svelte:body
	use:style={{ height: '100vh', margin: '0px', padding: '0px', border: '0px solid red' }}
/>

<ElectricityDashboard bind:styles />

<!-- <style>
	@import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';

	body,
	html {
		font-family: ProximaNova, sans-serif;
		font-size: 13px;
	}
</style> -->
