<script lang="ts">
	import type { PageData } from './$types';
	import { SvelteToast } from '@zerodevx/svelte-toast';
	import * as pmtiles from 'pmtiles';
	import maplibregl from 'maplibre-gl';
	import { Footer, Header, type HeaderLink } from '@undp-data/svelte-undp-design';
	import { FooterItems, HeaderItems } from '$lib/config/AppConfig';
	import UserAccount from '$components/UserAccount.svelte';

	export let data: PageData;

	export let headerHeight: number;

	let links: HeaderLink[] = HeaderItems(['home', 'data', 'map', 'support']);
	if (!data.session) {
		links = [...links.filter((l) => l.href !== '/data')];
	}

	let protocol = new pmtiles.Protocol();
	maplibregl.addProtocol('pmtiles', protocol.tile);
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

<div style="margin-top: {headerHeight}px">
	<slot />
</div>

<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" footerItems={FooterItems} />

<SvelteToast />

<style global lang="scss">
	@import '@undp-data/undp-bulma/bulma.scss';
	@import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';
	@import '@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css';
	@import 'bulma-switch/dist/css/bulma-switch.min.css';
	@import 'bulma-divider/dist/css/bulma-divider.min.css';
	@import '/node_modules/flag-icons/css/flag-icons.min.css';

	.header {
		position: fixed;
		width: 100%;
		background-color: white;
		z-index: 99;
	}
</style>
