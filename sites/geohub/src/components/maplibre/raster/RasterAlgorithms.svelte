<script lang="ts">
	import FieldControl from '$components/util/FieldControl.svelte';
	import {
		getLayerSourceUrl,
		getLayerStyle,
		getValueFromRasterTileUrl,
		isRgbRaster,
		updateParamsInURL
	} from '$lib/helper';
	import type { Link, RasterAlgorithm, RasterTileMetadata } from '$lib/types';
	import {
		COLORMAP_NAME_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		RASTERRESCALE_CONTEXT_KEY,
		type ColorMapNameStore,
		type MapStore,
		type RasterRescaleStore
	} from '$stores';
	import { Loader } from '@undp-data/svelte-undp-design';
	import { createEventDispatcher, getContext, onMount } from 'svelte';

	const dispatch = createEventDispatcher();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const rescaleStore: RasterRescaleStore = getContext(RASTERRESCALE_CONTEXT_KEY);
	const colorMapNameStore: ColorMapNameStore = getContext(COLORMAP_NAME_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	export let links: Link[] = [];

	const isRgbTile = isRgbRaster(metadata.colorinterp);

	let algorithmsLink = links.find((l) => l.rel === 'algorithms')?.href;

	let availableBands =
		metadata.band_metadata.length > 0
			? (metadata.band_metadata.map((meta) => meta[0]) as string[])
			: [];

	let selectedAlgorithm = '';
	let algorithms: { [key: string]: RasterAlgorithm };

	const getAlgorithms = async () => {
		const res = await fetch(algorithmsLink);
		algorithms = await res.json();
	};

	const handleSelectAlgorithm = () => {
		const layerStyle = getLayerStyle($map, layerId);
		const layerUrl = getLayerSourceUrl($map, layerId) as string;
		if (!(layerUrl && layerUrl.length > 0)) return;
		const layerURL = new URL(layerUrl);

		if (selectedAlgorithm.length === 0) {
			if (isRgbTile) {
				layerURL.searchParams.delete('algorithm');
				layerURL.searchParams.delete('colormap');
				layerURL.searchParams.delete('colormap_name');
				layerURL.searchParams.delete('rescale');
				layerURL.searchParams.delete('bidx');
				updateParamsInURL(layerStyle, layerURL, {}, map);
			} else {
				let bandIndex = availableBands.findIndex((b) => b === metadata.active_band_no) + 1;

				layerURL.searchParams.delete('algorithm');
				updateParamsInURL(
					layerStyle,
					layerURL,
					{
						rescale: $rescaleStore.join(','),
						colormap_name: $colorMapNameStore,
						bidx: `${bandIndex}`
					},
					map
				);
			}
		} else {
			layerURL.searchParams.delete('algorithm');
			layerURL.searchParams.delete('colormap');
			layerURL.searchParams.delete('colormap_name');
			layerURL.searchParams.delete('rescale');
			layerURL.searchParams.delete('bidx');
			updateParamsInURL(
				layerStyle,
				layerURL,
				{
					algorithm: selectedAlgorithm
				},
				map
			);
		}

		dispatch('change', {
			id: selectedAlgorithm,
			algorithm: algorithms[selectedAlgorithm] ?? undefined
		});
	};

	onMount(() => {
		selectedAlgorithm = (getValueFromRasterTileUrl($map, layerId, 'algorithm') as string) ?? '';
		getAlgorithms();
	});
</script>

{#if algorithms && Object.keys(algorithms)?.length > 0}
	<FieldControl title="Algorithm">
		<div slot="help">
			You can apply for an algorithm to switch default layer style to different layer type.
		</div>
		<div slot="control">
			<div class="select is-fullwidth">
				<select bind:value={selectedAlgorithm} on:change={handleSelectAlgorithm}>
					<option value="">Use default</option>
					{#each Object.keys(algorithms) as name}
						{@const algo = algorithms[name]}
						{#if algo.inputs.nbands <= availableBands.length}
							<option value={name}>{name}</option>
						{/if}
					{/each}
				</select>
			</div>
		</div>
	</FieldControl>
{:else}
	<div class="is-flex is-justify-content-center"><Loader size="small" /></div>
{/if}
