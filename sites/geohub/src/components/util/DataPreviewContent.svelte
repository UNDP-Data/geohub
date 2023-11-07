<script lang="ts">
	import { page } from '$app/stores';
	import MiniMap from '$components/util/MiniMap.svelte';
	import { VectorTileData } from '$lib/VectorTileData';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import type { DatasetFeature, VectorLayerTileStatLayer } from '$lib/types';
	import { DefaultLink } from '@undp-data/svelte-undp-design';
	import { onMount } from 'svelte';
	import LayerTypeSwitch from './LayerTypeSwitch.svelte';

	export let isLoadMap = false;

	export let url: string;
	export let feature: DatasetFeature;
	export let width = '370px';

	let config: UserConfig = $page.data.config;

	let innerWidth: number;

	let isPmtiles = url.indexOf('.pmtiles') !== -1 ? true : false;

	let tilestatsLayers: VectorLayerTileStatLayer[] = [];
	let selectedVectorLayer: VectorLayerTileStatLayer;
	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring';

	const getMetadata = async () => {
		if (feature.properties.is_raster) return;
		const vectorTile = new VectorTileData(feature, config.FillExtrusionDefaultPitch);
		const metadata = await vectorTile.getMetadata();
		tilestatsLayers = metadata.json?.tilestats?.layers;
		selectedVectorLayer = tilestatsLayers[0];
	};

	onMount(() => {
		getMetadata();
	});
</script>

<svelte:window bind:innerWidth />

<div>
	{#if feature}
		{#if !feature.properties.is_raster}
			{#if tilestatsLayers.length > 0}
				<div class="vector-config p-2">
					{#if tilestatsLayers.length > 1}
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label">Please select a layer to preview</label>
							<div class="control">
								<div class="select is-link">
									<select bind:value={selectedVectorLayer}>
										{#each tilestatsLayers as layer}
											<option value={layer}>{layer.layer}</option>
										{/each}
									</select>
								</div>
							</div>
						</div>
					{/if}
					<div class="mt-2">
						<LayerTypeSwitch bind:layer={selectedVectorLayer} bind:layerType />
					</div>
				</div>
			{/if}
			{#if selectedVectorLayer}
				{#key selectedVectorLayer}
					<MiniMap
						bind:feature
						{isLoadMap}
						{width}
						height={innerWidth < 768 ? '200px' : '320px'}
						layer={selectedVectorLayer}
						bind:layerType
					/>
				{/key}
			{/if}
		{:else}
			<MiniMap bind:feature {isLoadMap} {width} height={innerWidth < 768 ? '200px' : '320px'} />
		{/if}
	{/if}
	{#if isPmtiles}
		<p class="help is-dark is-size-6">
			See the metadata at PMTiles Viewer by
			<DefaultLink
				href={`https://protomaps.github.io/PMTiles?url=${encodeURIComponent(url)}`}
				target="_blank"
				title="clicking here"
			/>
		</p>
	{/if}
</div>

<style lang="scss">
	.vector-config {
		max-width: 300px;
	}
</style>
