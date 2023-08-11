<script lang="ts">
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import * as pmtiles from 'pmtiles';
	import maplibregl from 'maplibre-gl';

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);
</script>

<svelte:head>
	<style type="text/css">
		html,
		body {
			margin: 0;
			padding: 0;
			min-height: 100vh;
			/* mobile viewport bug fix */
			min-height: -webkit-fill-available;
			font-family: ProximaNova, sans-serif;
			font-size: 13px;
		}

		html {
			overflow-y: hidden !important;
			height: -webkit-fill-available;
		}
	</style>
</svelte:head>

<slot />

<SvelteToast />

<style global lang="scss">
	@import '@undp-data/undp-bulma/bulma.scss';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import '/node_modules/flag-icons/css/flag-icons.min.css';
</style>
