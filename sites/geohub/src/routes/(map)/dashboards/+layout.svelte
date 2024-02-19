<script lang="ts">
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount } from 'svelte';

	onMount(() => {
		let protocol = new pmtiles.Protocol();
		addProtocol('pmtiles', protocol.tile);
	});
</script>

<svelte:head>
	<style type="text/css">
		html {
			overflow-y: hidden !important;
		}
	</style>
</svelte:head>

<slot />
