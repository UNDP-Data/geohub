<script lang="ts">
	import { Header, type HeaderLink } from '@undp-data/svelte-undp-design';
	import { HeaderItems } from '$lib/config/AppConfig';
	import UserAccount from '$components/UserAccount.svelte';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import { fromLocalStorage, storageKeys } from '$lib/helper';
	import { page } from '$app/stores';

	export let headerHeight: number;
	let showMobileMenu = false;

	let links: HeaderLink[];
	const updateLinks = () => {
		links = HeaderItems(['home', 'data', 'map', 'support']);

		const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);
		const initialMapStyleId: string = fromLocalStorage(mapStyleIdStorageKey, null)?.toString();
		if (initialMapStyleId) {
			const map = links.find((l) => l.id === 'header-link-map');
			map.href = `/map/${initialMapStyleId}`;
		}
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
		isPositionFixed={true}
		bind:links
		bind:showMobileMenu
	>
		<div slot="custom-button">
			<UserAccount />
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
