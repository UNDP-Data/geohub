<script lang="ts">
	import { MapAnimation } from '$lib/config/AppConfig';
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
			center: [0, 0],
			zoom: 1,
			interactive: true,
			attributionControl: false,
			hash: false
		});
		map.addControl(new AttributionControl({ compact: false }), 'bottom-right');

		setTimeout(() => {
			playAnimation();
			setInterval(playAnimation, lastPoint.Pause + lastPoint.Duration);
		}, 5000);
	}

	$: innerHeight, resizeMap();
	const resizeMap = () => {
		map?.triggerRepaint();
		map?.resize();
	};

	const lastPoint = MapAnimation[MapAnimation.length - 1];
	const playAnimation = () => {
		MapAnimation.forEach(function (item) {
			setTimeout(function () {
				map.flyTo({
					duration: item.Duration,
					center: [item.lng, item.lat],
					zoom: item.Zoom,
					bearing: item.Rotation,
					pitch: item.Pitch,
					essential: true
				});
			}, item.Pause);
		});
	};
</script>

<svelte:window bind:innerHeight />

<div bind:this={container} class="map" />

<style lang="scss">
	$height: calc(100vh);

	.map {
		width: 100%;
		height: calc($height - 93.44px);

		@media (max-width: 63.9375em) {
			height: calc($height - 60.94px);
		}
	}
</style>
