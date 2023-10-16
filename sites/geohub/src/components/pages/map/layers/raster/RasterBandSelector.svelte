<script lang="ts">
	import { getActiveBandIndex, getLayerStyle, updateParamsInURL } from '$lib/helper';
	import type { Layer, RasterTileMetadata } from '$lib/types';
	import {
		LAYERLIST_STORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import type { RasterSourceSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerList: LayerListStore = getContext(LAYERLIST_STORE_CONTEXT_KEY);

	export let layer: Layer;

	let info: RasterTileMetadata = layer.info as RasterTileMetadata;
	let bands: string[] = undefined;
	let selected: string = undefined;

	const colorinterp = info?.colorinterp;
	const isRgbTile =
		colorinterp &&
		colorinterp.includes('red') &&
		colorinterp.includes('green') &&
		colorinterp.includes('blue');

	let layerStyle = getLayerStyle($map, layer.id);

	$: selected, setActiveBand();
	const setActiveBand = () => {
		if (!info) return;
		if (info?.isMosaicJson) return;
		if (info.active_band_no === selected) return;

		updateLayerInfo(layer.info, selected);
		$map.once('sourcedata', () => {
			$layerList = [...$layerList];
		});
	};

	if (layerStyle.type === 'raster') {
		({ info } = layer);
		selected = info.active_band_no;
		if (info.band_metadata.length > 0) {
			bands = info.band_metadata.map((meta) => meta[0]) as string[];
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

{#if !isRgbTile && layerStyle && layerStyle.type === 'raster' && !info.isMosaicJson}
	<!-- Only show raster band selector if bands are available more than one. -->
	{#if bands.length > 1}
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label has-text-centered">Raster band</label>
			<div class="control">
				<div class="select is-fullwidth">
					<select bind:value={selected}>
						{#each bands as band}
							<option value={band}>B{band}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	{/if}
{/if}
