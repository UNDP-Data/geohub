<script lang="ts">
	import { MapAnimation, MapStyles } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import { AttributionControl, Map } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { getContext, onMount } from 'svelte';

	let container: HTMLDivElement | undefined = $state();
	let innerHeight = $state(1000);
	let map: Map;
	interface Props {
		interactive?: boolean;
		excludeHeaderHeight?: boolean;
		styleId: number;
		width?: string;
		height?: number;
	}

	let {
		interactive = $bindable(true),
		excludeHeaderHeight = $bindable(true),
		styleId = $bindable(),
		width = $bindable('100%'),
		height = $bindable(0)
	}: Props = $props();

	let headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);

	onMount(() => {
		let styleUrl = `/api/style/${styleId}.json`;
		fetch(styleUrl).then((res) => {
			if (!container) return;
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
	});

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
	let mapHeight = $derived(
		height > 0 ? height : excludeHeaderHeight ? innerHeight - $headerHeightStore : innerHeight
	);
	$effect(() => {
		resizeMap();
	});
</script>

<svelte:window bind:innerHeight />

<div
	bind:this={container}
	class="map map-wrapper"
	style="height: {mapHeight}px; width: {width};"
></div>

<style lang="scss">
	:global(.map-wrapper .maplibregl-ctrl-bottom-right) {
		margin-right: 10px;
		margin-bottom: 5px;
	}
</style>
