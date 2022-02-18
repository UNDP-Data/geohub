<script lang="ts">
	import { onMount } from 'svelte';
	import { map } from '../stores/mapstore';
	
	import {Map} from 'maplibre-gl' ;

	// set the context here...

	export let lat: number = 0;
	export let lon: number = 0;
	export let zoom: number = 3;

	let container: any ;
	
	
	const style = {
		"version": 8,
			"sources": {
			"osm": {
					"type": "vector",
					"tiles": ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
					"tileSize": 256,
			"attribution": "&copy; OpenStreetMap Contributors",
			"maxzoom": 19
			}
		},
		"layers": [
			{
			"id": "osm",
			"type": "vector",
			"source": "osm" // This must match the source key above
			}
		]
	};

	

    
        
	

    onMount( () => {
        
		let new_map = new Map({
			container,
			//container:"map",
			style: 'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
			
			//style: 'https://demotiles.maplibre.org/style.json',
			center: [lon, lat],
			zoom,
		});
        
		//setMap(new_map);
		map.update(m=>new_map);

    
	});
        
	

        
       
</script>

<!-- this special element will be explained in a later section -->
<svelte:head>
	<link
		rel="stylesheet"
		href="https://unpkg.com/maplibre-gl@2.1.1/dist/maplibre-gl.css"
        
        
	/>
   
</svelte:head>

<div bind:this={container}>
    
	{#if map}
		<slot />
	{/if}
</div>



<style>
	

	
    :global(.maplibregl-map) {
        height: 100%;
        width: 100%;
        /* // sometimes mapbox objects don't render as expected; troubleshoot by changing the height/width to px */
    }

</style>