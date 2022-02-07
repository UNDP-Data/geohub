<script>
	import { onDestroy, setContext } from 'svelte';
	import {key} from '../mapbox';
	import { Map } from 'maplibre-gl'

	setContext(key, {
		getMap:()=>map,
	});

	export let lat;
	export let lon;
	export let zoom;

	let container;
	let map;

	function load() {
		map = new Map({
			container,
			style: 'https://api.maptiler.com/maps/b0d74139-0393-42b0-8847-d0ac0b93ce8c/style.json?key=2MFd4TFNUb80HJkD8h5v',
			//style: {version: 8,sources: {},layers: []},
			center: [lon, lat],
			zoom,
		});
	}

	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<!-- this special element will be explained in a later section -->
<svelte:head>
	<link
		rel="stylesheet"
		href="https://unpkg.com/maplibre-gl@2.1.1/dist/maplibre-gl.css"
		on:load={load}
	/>
</svelte:head>

<div class='map-wrap' bind:this={container}>
	{#if map}
		<slot />
	{/if}
</div>

<style>
    div {
        width: 100%;
        height: 100vh
    }
</style>
