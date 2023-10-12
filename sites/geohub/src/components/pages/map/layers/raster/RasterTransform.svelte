<script lang="ts">
	import RasterTransformAdvanced from '$components/pages/map/layers/raster/RasterTransformAdvanced.svelte';
	import RasterTransformSimple from '$components/pages/map/layers/raster/RasterTransformSimple.svelte';
	import type { Layer } from '$lib/types';
	import { Tabs } from '@undp-data/svelte-undp-design';

	export let layer: Layer;

	let activeTab = 'Simple';
	let isAdvancedPanelVisible = false;
	let isSimplePanelVisible = false;

	$: {
		isAdvancedPanelVisible = false;
		isSimplePanelVisible = false;

		switch (activeTab) {
			case 'Advanced':
				isAdvancedPanelVisible = true;
				isSimplePanelVisible = false;
				break;
			case 'Simple':
				isSimplePanelVisible = true;
				isAdvancedPanelVisible = false;
				break;

			default:
				break;
		}
	}

	let tabs = [
		{ label: 'Simple', icon: 'fa-solid fa-thumbs-up' },
		{ label: 'Advanced', icon: 'fa-solid fa-magnifying-glass-plus' }
	];
</script>

<nav class="block">
	<Tabs bind:tabs bind:activeTab fontSize="small" />

	<div class="block" />
	<p>
		{#if isSimplePanelVisible === true}
			<RasterTransformSimple bind:layer />
		{/if}
		{#if isAdvancedPanelVisible}
			<RasterTransformAdvanced bind:layer />
		{/if}
	</p>
</nav>
