<script lang="ts">
	import { page } from '$app/stores';
	import BackToTop from '$components/BackToTop.svelte';
	import Header from '$components/Header.svelte';
	import { FooterItems } from '$lib/config/AppConfig';
	import { fromLocalStorage, storageKeys } from '$lib/helper';
	import { Footer } from '@undp-data/svelte-undp-design';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	let headerHeight = writable<number>(115);

	setContext('headerHeight', headerHeight);

	const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
	const initialMapStyleId: string = fromLocalStorage(mapStyleIdStorageKey, null)?.toString();

	let footerItems = FooterItems;
	let mapItem = footerItems['GeoHub'].find((i) => i.title === 'Map');
	mapItem.url = `/map${initialMapStyleId ? `/${initialMapStyleId}` : ''}`;
</script>

<div class="header">
	<Header bind:headerHeight={$headerHeight} />
</div>

<div style="margin-top: {$headerHeight}px">
	<slot />
</div>

<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems />

<BackToTop />

<style global lang="scss">
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import '/node_modules/flag-icons/css/flag-icons.min.css';
</style>
