<script lang="ts">
	import { getLayerStyle } from '$lib/helper';
	import type { Layer, RasterTileMetadata, VectorTileMetadata } from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, type MapStore } from '$stores';
	import type { LngLatBoundsLike } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let layer: Layer;

	const handleClick = () => {
		let bounds: LngLatBoundsLike;
		const layerStyle = getLayerStyle($map, layer.id);
		if (layerStyle.type === 'raster') {
			const metadata: RasterTileMetadata = layer.info as RasterTileMetadata;
			bounds = [
				[Number(metadata.bounds[0]), Number(metadata.bounds[1])],
				[Number(metadata.bounds[2]), Number(metadata.bounds[3])]
			];
		} else {
			const metadata: VectorTileMetadata = layer.info as VectorTileMetadata;
			const boundsArray = metadata.bounds.split(',');
			bounds = [
				[Number(boundsArray[0]), Number(boundsArray[1])],
				[Number(boundsArray[2]), Number(boundsArray[3])]
			];
		}
		$map.fitBounds(bounds);
	};

	const handleKeyDown = (event: KeyboardEvent) => {
		if (event.key === 'Enter') {
			handleClick();
		}
	};
</script>

<div class="has-tooltip-left has-tooltip-arrow" data-tooltip="Zoom to layer">
	<div
		class="icon-selected"
		tabindex="0"
		role="button"
		on:click={handleClick}
		on:keydown={handleKeyDown}
	>
		<i class="fa-solid fa-magnifying-glass fa-sm" />
	</div>
</div>

<style lang="scss">
	.icon-selected {
		opacity: 0.5;
		display: inline;
		cursor: pointer;

		&:hover {
			opacity: 1;
		}
	}
</style>
