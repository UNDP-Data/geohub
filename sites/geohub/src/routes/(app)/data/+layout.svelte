<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import maplibregl from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);
</script>

<div class="m-4 py-4">
	<slot />
</div>

<SvelteToast />
