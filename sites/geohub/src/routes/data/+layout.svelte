<script lang="ts">
	import { page } from '$app/stores';
	import { Header, Footer, type HeaderLink } from '@undp-data/svelte-undp-design';
	import UserAccount from '$components/UserAccount.svelte';
	import { FooterItems, HeaderItems } from '$lib/config/AppConfig';

	let headerHeight: number;

	let links: HeaderLink[] = HeaderItems(['home', 'maps', 'dashboard', 'userguide']);

	let title = 'GeoHub | Data';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
</svelte:head>

<div class="header">
	<Header
		region="UNDP's one stop shop for spatial data and analytics"
		siteTitle="GeoHub Data"
		url="https://geohub.data.undp.org"
		logoUrl="/assets/undp-images/undp-logo-blue.svg"
		bind:height={headerHeight}
		isPositionFixed={true}
		bind:links
	>
		<div slot="custom-button">
			<UserAccount />
		</div>
	</Header>
</div>

<div class="main-section mb-4" style="margin-top: {headerHeight}px">
	{#if $page.data.session}
		<slot />
	{:else}
		<div class="container m-4">
			<p class="title is-4">403</p>
			<p class="subtitle is-5 has-text-justified pt-4">
				No permission to access this page. Please sign in.
			</p>
		</div>
	{/if}
</div>

<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" footerItems={FooterItems} />

<style lang="scss">
	.header {
		position: fixed;
		width: 100%;
		background-color: white;
		z-index: 999;
	}

	.main-section {
		padding-top: 1rem;
		padding-left: 1.5rem;
		padding-right: 1.5rem;
	}
</style>
