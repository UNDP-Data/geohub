<script lang="ts">
	import Content from './components/Content.svelte';
	import Map from './components/Map.svelte';
	import type { StyleDefinition } from '@undp-data/style-switcher';
	let loadLayers = () => {
		return;
	};

	export let styles: StyleDefinition[];
</script>

<Content bind:loadLayers>
	<Map on:styleChanged={loadLayers} bind:styles />
</Content>

<style>
	@import 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
</style>
