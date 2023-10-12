<script lang="ts">
	import { browser } from '$app/environment';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	import UserAccount from '$components/header/UserAccount.svelte';
	import { HeaderItems } from '$lib/config/AppConfig';
	import { Header, type HeaderLink } from '@undp-data/svelte-undp-design';

	export let headerHeight: number;
	export let isPositionFixed = true;
	let showMobileMenu = false;

	let links: HeaderLink[];
	const updateLinks = () => {
		links = HeaderItems(['home', 'data', 'map', 'support']);
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
