<script lang="ts">
	import { AttributionControl, Map } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let container: HTMLDivElement;

	const styleId = 209;

	$: if (container) {
		const map = new Map({
			container,
			style: `/api/style/${styleId}.json`,
			zoom: 2,
			interactive: true,
			attributionControl: false
		});
		map.addControl(new AttributionControl({ compact: false }), 'bottom-right');
	}
</script>

<div bind:this={container} class="map" />

<style>
	.map {
		width: 100%;
		height: 600px;
	}
</style>
