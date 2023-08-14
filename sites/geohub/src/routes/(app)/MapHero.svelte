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
			center: [0, 0],
			zoom: 1,
			interactive: true,
			attributionControl: false
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

	const mapAnimation = [
		{
			lng: 7.77,
			lat: 11.86,
			Zoom: 2.42,
			Duration: 5000,
			Pause: 0,
			Rotation: 0,
			Pitch: 0
		},
		{
			lng: 29.63,
			lat: 2.05,
			Zoom: 4.42,
			Duration: 5000,
			Pause: 3000,
			Rotation: 0,
			Pitch: 0
		},
		{
			lng: 36.298,
			lat: -0.97,
			Zoom: 7.28,
			Duration: 10000,
			Pause: 8000,
			Rotation: 0,
			Pitch: 0
		},
		{
			lng: 7.77,
			lat: 11.86,
			Zoom: 2.42,
			Duration: 20000,
			Pause: 18000,
			Rotation: 0,
			Pitch: 0
		}
	];
	const lastPoint = mapAnimation[mapAnimation.length - 1];
	const playAnimation = () => {
		mapAnimation.forEach(function (item) {
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
		height: calc($height - 115px);

		@media (max-width: 63.9375em) {
			height: calc($height - 75px);
		}
	}
</style>
