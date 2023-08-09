<script lang="ts">
	import { page } from '$app/stores';
	import { Header, type HeaderLink } from '@undp-data/svelte-undp-design';
	import StyleShare from './StyleShare.svelte';
	import { layerList } from '$stores';
	import UserAccount from './UserAccount.svelte';
	import { HeaderItems } from '$lib/config/AppConfig';

	export let height: number = undefined;

	let isStyleShareVisible = false;

	const shareLink = {
		id: 'header-link-styleshare',
		title: 'Share',
		tooltip: 'Save & share map',
		href: '#',
		callback: () => {
			isStyleShareVisible = true;
		}
	};

	let finalLink: HeaderLink[] = [];

	const initLinks = () => {
		let links: HeaderLink[] = [...HeaderItems(['maps', 'data', 'dashboard', 'userguide'])];

		if ($page.data.session && $layerList.length > 0) {
			links = [links[0], shareLink, ...links.slice(1)];
		}
		if (!$page.data.session) {
			links = links.filter((l) => l.href !== '/data');
		}
		finalLink = [...links];
	};
	$: $layerList, initLinks();
</script>

<Header
	bind:height
	region="UNDP's one stop shop for spatial data and analytics"
	siteTitle="GeoHub"
	url="https://geohub.data.undp.org"
	logoUrl="assets/undp-images/undp-logo-blue.svg"
	isPositionFixed={false}
	bind:links={finalLink}
>
	<div slot="custom-button">
		<UserAccount />
	</div>
</Header>
<StyleShare bind:isModalVisible={isStyleShareVisible} />

<style lang="scss">
	:global(.menu-item) {
		margin: 0.75rem 1.75rem 0.75rem 0 !important;
	}
</style>
