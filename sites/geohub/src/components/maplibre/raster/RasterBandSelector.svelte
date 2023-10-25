<script lang="ts">
	import { getActiveBandIndex, getLayerStyle, isRgbRaster, updateParamsInURL } from '$lib/helper';
	import type { RasterTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { RasterSourceSpecification } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';

	const dispatch = createEventDispatcher();

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layerId: string;
	export let metadata: RasterTileMetadata;
	let bands: string[] = undefined;
	let selected: string = undefined;

	const isRgbTile = isRgbRaster(metadata.colorinterp);

	let layerStyle = getLayerStyle($map, layerId);

	$: selected, setActiveBand();
	const setActiveBand = () => {
		if (!metadata) return;
		if (metadata?.isMosaicJson) return;
		if (metadata.active_band_no === selected) return;

		updateLayerInfo(metadata, selected);
		// $map.once('sourcedata', () => {
		// 	$layerList = [...$layerList];
		// });
		dispatch('change', {
			layerId: layerId,
			active_band_no: metadata.active_band_no
		});
	};

	if (layerStyle.type === 'raster') {
		selected = metadata.active_band_no;
		if (metadata.band_metadata.length > 0) {
			bands = metadata.band_metadata.map((meta) => meta[0]) as string[];
		}
	}

	const updateLayerInfo = (metadata: RasterTileMetadata, bandName: string) => {
		const layerSrc: RasterSourceSpecification = $map.getSource(
			layerStyle.source
		) as RasterSourceSpecification;
		if (!(layerSrc.tiles && layerSrc.tiles.length > 0)) return;
		const layerURL = new URL(layerSrc.tiles[0]);
		layerURL.searchParams.delete('bidx');
		metadata.active_band_no = bandName;
		const bandIndex = getActiveBandIndex(metadata);
		layerURL.searchParams.set('bidx', `${bandIndex + 1}`);
		layerSrc.tiles[0] = layerURL.toString();
		updateParamsInURL(layerStyle, layerURL, {}, map);
	};
</script>

{#if !isRgbTile && layerStyle && layerStyle.type === 'raster' && !metadata.isMosaicJson}
	<div class="select is-fullwidth">
		<select bind:value={selected}>
			{#each bands as band}
				<option value={band}>B{band}</option>
			{/each}
		</select>
	</div>
{/if}
