<script lang="ts">
	import { Header, type HeaderLink } from '@undp-data/svelte-undp-design';
	import { HeaderItems } from '$lib/config/AppConfig';
	import UserAccount from '$components/UserAccount.svelte';
	import { afterNavigate } from '$app/navigation';

	export let headerHeight: number;

	let links: HeaderLink[];
	const updateLinks = () => {
		links = HeaderItems(['home', 'data', 'map', 'support']);
	};
	updateLinks();

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
