<script lang="ts">
	import Header from '$components/header/Header.svelte';
	import MapHero from '$components/pages/home/MapHero.svelte';
	import { MapStyleId } from '$lib/config/AppConfig';
	import { HEADER_HEIGHT_CONTEXT_KEY, createHeaderHeightStore } from '$stores';
	import { setContext } from 'svelte';

	const headerHeightStore = createHeaderHeightStore();
	setContext(HEADER_HEIGHT_CONTEXT_KEY, headerHeightStore);
</script>

<svelte:head>
	<style type="text/css">
		html {
			overflow-y: hidden !important;
		}
	</style>
</svelte:head>

<div class="header">
	<Header showSignin={false} />
</div>

<div class="map-hero" style="margin-top: {$headerHeightStore}px">
	<MapHero styleId={MapStyleId} interactive={false} />

	<slot />
</div>

<style lang="scss">
	.map-hero {
		position: relative;
	}
</style>
