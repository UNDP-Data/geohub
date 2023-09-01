<script lang="ts">
	import {
		getActiveBandIndex,
		getLayerStyle,
		handleEnterKey,
		initTippy,
		updateParamsInURL
	} from '$lib/helper';
	import type { Layer, RasterTileMetadata } from '$lib/types';
	import { layerList, map } from '$stores';
	import type { RasterSourceSpecification } from 'maplibre-gl';

	const tippy = initTippy({
		placement: 'bottom-start'
	});
	let tooltipContent: HTMLElement;

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
		updateParamsInURL(layerStyle, layerURL, {});
	};
</script>

{#if !isRgbTile && layerStyle && layerStyle.type === 'raster' && !info.isMosaicJson}
	<button
		class="selected-band tag is-success"
		disabled={bands.length < 2}
		use:tippy={{ content: tooltipContent }}>B{selected}</button
	>
	<div bind:this={tooltipContent} class="tooltip p-2">
		<nav class="panel">
			{#each bands as band}
				<!-- svelte-ignore a11y-missing-attribute -->
				<a
					class="panel-block {selected === band ? 'is-active' : ''}"
					role="button"
					tabindex="0"
					on:click={() => {
						selected = band;
					}}
					on:keydown={handleEnterKey}
				>
					<span class="panel-icon">
						<i class="fa-solid fa-layer-group" aria-hidden="true" />
					</span>
					B{band}
				</a>
			{/each}
		</nav>
	</div>
{/if}

<style lang="scss">
	.selected-band {
		cursor: pointer;
	}
</style>
