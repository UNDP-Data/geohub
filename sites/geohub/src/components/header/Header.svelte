<script lang="ts">
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/stores';
	import UserAccount from '$components/header/UserAccount.svelte';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import { Header } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';

	let headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);

	export let isPositionFixed = true;
	export let showSignin = true;

	let showMobileMenu = false;
	let headerLinks = $page.data.headerLinks;

	beforeNavigate(() => {
		showMobileMenu = false;
	});
</script>

<div class="header">
	<Header
		region="DATA FUTURES EXCHANGE"
		siteTitle="GeoHub"
		url="/"
		regionUrl="https://data.undp.org/"
		logoUrl="/assets/undp-images/undp-logo-blue.svg"
		bind:height={$headerHeightStore}
		{isPositionFixed}
		bind:links={headerLinks}
		bind:showMobileMenu
	>
		<div slot="custom-button">
			{#if browser && showSignin}
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
