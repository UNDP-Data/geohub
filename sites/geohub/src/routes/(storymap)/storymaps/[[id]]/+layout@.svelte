<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import { addProtocol } from 'maplibre-gl';
	import * as pmtiles from 'pmtiles';
	import { onMount, setContext } from 'svelte';
	let innerWidth = 0;

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);

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

<svelte:window bind:innerWidth />

<div class="header">
	<Header isPositionFixed={true} />
</div>

<div style="margin-top: {$headerHeightStore}px">
	<slot />
</div>

<SvelteToast />
