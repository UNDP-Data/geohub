<script lang="ts">
	import { MapAnimation, MapStyles } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import { AttributionControl, Map } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { getContext, onMount } from 'svelte';

	let container: HTMLDivElement;
	let innerHeight = 1000;
	let innerWidth: number;
	let map: Map;
	export let interactive = true;
	export let excludeHeaderHeight = true;
	export let styleId: number;

	let headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);

	$: mapHeight = excludeHeaderHeight ? innerHeight - $headerHeightStore : innerHeight;

	onMount(async () => {
		let styleUrl = `/api/style/${styleId}.json`;
		const res = await fetch(styleUrl);
		if (!res.ok) {
			styleUrl = MapStyles[0].uri;
		}
		map = new Map({
			container,
			style: styleUrl,
			center: [0, 0],
			zoom: 1,
			interactive: interactive,
			attributionControl: false,
			hash: false
		});
		map.addControl(new AttributionControl({ compact: false }), 'bottom-right');

		setTimeout(() => {
			playAnimation();
			setInterval(playAnimation, lastPoint.Pause + lastPoint.Duration);
		}, 5000);

		map.once('styledata', () => {
			resizeMap();
		});
	});

	$: mapHeight, resizeMap();
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

<svelte:window bind:innerHeight bind:innerWidth />

<div bind:this={container} class="map" style="height: {mapHeight}px; width: 100%;" />
