<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import UserAccount from '$components/UserAccount.svelte';
	import { HeaderItems } from '$lib/config/AppConfig';
	import { fromLocalStorage, storageKeys } from '$lib/helper';
	import { Header, type HeaderLink } from '@undp-data/svelte-undp-design';

	export let headerHeight: number;
	export let isPositionFixed = true;
	let showMobileMenu = false;

	let links: HeaderLink[];
	const updateLinks = () => {
		links = HeaderItems(['home', 'data', 'map', 'support']);

		const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
		const initialMapStyleId: string = fromLocalStorage(mapStyleIdStorageKey, null)?.toString();
		const map = links.find((l) => l.id === 'header-link-map');
		if (initialMapStyleId) {
			map.href = `/map/${initialMapStyleId}`;
		}
		map.callback = () => {
			document.location = map.href;
		};
	};
	updateLinks();

	beforeNavigate(() => {
		showMobileMenu = false;
	});

	afterNavigate(() => {
		updateLinks();
	});
</script>

<div class="header">
	<Header
		region="UNDP's one stop shop for spatial data and analytics"
		siteTitle="GeoHub"
		url="/"
		logoUrl="/assets/undp-images/undp-logo-blue.svg"
		bind:height={headerHeight}
		{isPositionFixed}
		bind:links
		bind:showMobileMenu
	>
		<div slot="custom-button">
			{#if browser}
				<UserAccount />
			{/if}
		</div>
	</Header>
</div>

<style lang="scss">
	.header {
		position: fixed;
		width: 100%;
		background-color: white;
		z-index: 99;
	}
</style>
