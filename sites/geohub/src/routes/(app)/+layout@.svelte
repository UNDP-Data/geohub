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
	mapItem.callback = () => {
		document.location = mapItem.url;
	};
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
			height: -webkit-fill-available;
		}
	</style>
</svelte:head>

<div class="header">
	<Header bind:headerHeight={$headerHeight} />
</div>

<div style="margin-top: {$headerHeight}px">
	<slot />
</div>

<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems />

<BackToTop />

<style global lang="scss">
	@import '@undp-data/undp-bulma/bulma.scss';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import '/node_modules/flag-icons/css/flag-icons.min.css';
</style>
