<script lang="ts">
	import { browser } from '$app/environment';
	import { beforeNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import UserAccount from '$components/header/UserAccount.svelte';
	import { HEADER_HEIGHT_CONTEXT_KEY, type HeaderHeightStore } from '$stores';
	import { Header } from '@undp-data/svelte-undp-design';
	import { getContext } from 'svelte';

	let headerHeightStore: HeaderHeightStore = getContext(HEADER_HEIGHT_CONTEXT_KEY);

	interface Props {
		isPositionFixed?: boolean;
		showSignin?: boolean;
	}

	let { isPositionFixed = true, showSignin = true }: Props = $props();

	let showMobileMenu = $state(false);
	let headerLinks = $state(page.data.headerLinks);

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
		actionMenu={{
			title: 'CREATE/UPLOAD',
			placeholder: 'Create maps or upload datasets',
			showLanguageIcon: false,
			links: [
				{
					id: 'data-upload',
					title: 'Dataset',
					href: '/data/upload'
				},
				{
					id: 'new-map',
					title: 'Map',
					href: '/maps/edit'
				},
				{
					id: 'new-storymap',
					title: 'Storymap',
					href: '/storymaps/edit'
				}
			]
		}}
	>
		{#snippet customButton()}
			<div class="custom-button">
				{#if browser && showSignin}
					<UserAccount />
				{/if}
			</div>
		{/snippet}
	</Header>
</div>

<style lang="scss">
	.header {
		position: fixed;
		width: 100%;
		background-color: white;
		z-index: 99;

		@media (min-width: 63.9375em) {
			.custom-button {
				margin-left: 32px;
			}
		}
	}
</style>
