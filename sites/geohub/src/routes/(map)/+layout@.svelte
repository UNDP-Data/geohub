<script lang="ts">
	import maplibregl from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);
</script>

<svelte:head>
	<style type="text/css">
		html {
			overflow-y: hidden !important;
		}
	</style>
</svelte:head>

<slot />

<style global lang="scss">
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
</style>
