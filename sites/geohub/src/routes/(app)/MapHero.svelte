<script lang="ts">
	import { AttributionControl, Map } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let container: HTMLDivElement;
	let innerHeight: number;
	let map: Map;

	const styleId = 209;

	$: if (container) {
		map = new Map({
			container,
			style: `/api/style/${styleId}.json`,
			zoom: 2,
			interactive: true,
			attributionControl: false
		});
		map.addControl(new AttributionControl({ compact: false }), 'bottom-right');
	}

	$: innerHeight, resizeMap();
	const resizeMap = () => {
		map?.triggerRepaint();
		map?.resize();
	};
</script>

<svelte:window bind:innerHeight />

<div bind:this={container} class="map" />

<style lang="scss">
	$height: calc(100vh);

	.map {
		width: 100%;
		height: calc($height - 115px);

		@media (max-width: 63.9375em) {
			height: calc($height - 75px);
		}
	}
</style>
