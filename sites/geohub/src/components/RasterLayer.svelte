<script lang="ts">
	import { page } from '$app/stores';
	import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte';
	import OpacityPanel from '$components/controls/OpacityPanel.svelte';
	import RasterHistogram from '$components/controls/RasterHistogram.svelte';
	import RasterLegend from '$components/controls/RasterLegend.svelte';
	import RasterTransform from '$components/controls/RasterTransform.svelte';
	import { LegendTypes, TabNames } from '$lib/config/AppConfig';
	import type { Layer, RasterTileMetadata } from '$lib/types';
	import { fade } from 'svelte/transition';

	export let layer: Layer;

	let numberOfClasses = $page.data.config.NumberOfClasses;
	let legendType: LegendTypes;
	const rasterInfo: RasterTileMetadata = layer.info;
	const colorinterp = rasterInfo.colorinterp;
	const isRgbTile =
		colorinterp &&
		colorinterp.includes('red') &&
		colorinterp.includes('green') &&
		colorinterp.includes('blue');

	let tabs = [
		{ label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
		{ label: TabNames.HISTOGRAM, icon: 'fa-solid fa-chart-column' },
		{ label: TabNames.TRANSFORM, icon: 'fa-solid fa-shuffle' },
		{ label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' }
	];

	let activeTab = TabNames.LEGEND;

	if (isRgbTile || (rasterInfo?.isMosaicJson === true && rasterInfo?.band_metadata?.length > 1)) {
		tabs = [
			{ label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
			{ label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' }
		];
	}

	const handleEnterKey = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			e.target.click();
		}
	};
</script>

<div class="raster-layer-container has-background-white-bis" transition:fade|global>
	<nav class="panel">
		<p class="panel-heading has-background-grey-lighter p-2">
			<LayerNameGroup {layer} />
		</p>

		<div class="tabs is-fullwidth">
			<ul>
				{#each tabs as tab}
					<li class={activeTab === tab.label ? 'is-active' : ''}>
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							role="tab"
							tabindex="0"
							class="px-0 py-1"
							on:click={() => (activeTab = tab.label)}
							on:keydown={handleEnterKey}
						>
							<span class="icon is-small"><i class={tab.icon} aria-hidden="true"></i></span>
							<span>{tab.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<p class="panel-content px-2 pb-2">
			{#if activeTab === TabNames.LEGEND}
				<RasterLegend bind:layer bind:numberOfClasses bind:legendType />
			{/if}
			{#if !isRgbTile}
				{#if activeTab === TabNames.HISTOGRAM}
					<RasterHistogram bind:layer />
				{/if}
				{#if activeTab === TabNames.TRANSFORM}
					<RasterTransform bind:layer />
				{/if}
			{/if}
			{#if activeTab === TabNames.OPACITY}
				<OpacityPanel {layer} />
			{/if}
		</p>
	</nav>
</div>
