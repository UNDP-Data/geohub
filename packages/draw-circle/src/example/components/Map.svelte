<script lang="ts">
	import { onMount } from 'svelte';
	import { Map, NavigationControl, AttributionControl } from 'maplibre-gl';
	import { map } from '$example/stores';
	import { DrawCircle } from '$lib';

	let mapContainer: HTMLDivElement;

	onMount(async () => {
		const map2 = new Map({
			container: mapContainer,
			style: 'https://undp-data.github.io/style/style.json',
			center: { lng: 0, lat: 0 },
			zoom: 4,
			hash: true,
			attributionControl: false
		});
		map2.addControl(
			new NavigationControl({
				visualizePitch: false,
				showZoom: true,
				showCompass: true
			}),
			'top-right'
		);
		map2.addControl(new AttributionControl({ compact: true }), 'bottom-right');

		map.update(() => map2);
	});
</script>

<div class="map-wrap">
	<div class="map" id="map" bind:this={mapContainer} />

	<div class="content">
		<DrawCircle bind:map={$map} />
	</div>
</div>

<style lang="scss">
	@import 'maplibre-gl/dist/maplibre-gl.css';

	.map-wrap {
		position: relative;
		width: 100%;
		height: calc(100vh);

		.map {
			position: absolute;
			top: 0;
			bottom: 0;
			width: 100%;
			height: 100%;
			z-index: 1;
		}

		.content {
			position: absolute;
			top: 10px;
			left: 10px;
			z-index: 10;
		}
	}
</style>
