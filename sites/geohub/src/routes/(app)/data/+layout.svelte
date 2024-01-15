<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import maplibregl from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		maplibregl.addProtocol('pmtiles', protocol.tile);
	});
</script>

<slot />

<SvelteToast />
