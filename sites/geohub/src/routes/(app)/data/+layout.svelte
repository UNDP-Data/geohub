<script lang="ts">
	import * as pmtiles from 'pmtiles';
	import maplibregl from 'maplibre-gl';
	import { SvelteToast } from '@zerodevx/svelte-toast';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);
</script>

<div class="m-4 py-4">
	<slot />
</div>

<SvelteToast />
