<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { page } from '$app/state';
	import type { FooterItem } from '@undp-data/svelte-undp-design';
	import { Footer, Header } from '@undp-data/svelte-undp-design';
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';

	let title = $state(page.data.title ?? 'GeoHub Static Image API');
	let site_name = $state(page.data.site_name ?? 'GeoHub Static Image API');
	let site_description = $state(
		page.data.site_description ??
			'Static image API can generate an PNG image dynamically by specified maplibre style JSON.'
	);

	afterNavigate(() => {
		title = page.data.title ?? 'GeoHub Static Image API';
		site_name = page.data.site_name ?? 'GeoHub Static Image API';
		site_description =
			page.data.site_description ??
			'Static image API can generate an PNG image dynamically by specified maplibre style JSON.';
	});

	let headerHeight = writable(<number>0);
	setContext('header-height', headerHeight);

	let links = $state([
		{
			id: 'header-link-home',
			title: 'Home',
			href: '/'
		},
		{
			id: 'header-link-geohub',
			title: 'DOCS',
			href: '/api'
		}
	]);

	let footerItems: {
		[key: string]: FooterItem[];
	} = $state({
		'Static Image API': [
			{
				title: 'Home',
				url: '/'
			},
			{
				title: 'Documentation',
				url: '/api'
			}
		],
		GeoHub: [
			{
				title: 'Home',
				url: 'https://geohub.data.undp.org'
			}
		],
		'Data Futures Exchange': [
			{
				title: 'Home',
				url: 'https://data.undp.org'
			}
		]
	});

	interface Props {
		children?: import('svelte').Snippet;
	}

	let { children }: Props = $props();
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={site_description} />
	<meta property="og:description" content={site_description} />
	<meta name="twitter:description" content={site_description} />
	<meta property="og:title" content={title} />
	<!-- <meta property="og:image" content="{page.url.origin}/api/og?content={content}" /> -->
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<!-- <meta name="twitter:image" content="{page.url.origin}/api/og?content={content}" /> -->
	<meta property="og:url" content="{page.url.origin}{page.url.pathname}" />

	<style type="text/css">
		html,
		body {
			margin: 0;
			padding: 0;
			min-height: 100vh;
			/* mobile viewport bug fix */
			min-height: -webkit-fill-available;
			font-family: ProximaNova, sans-serif;
		}

		html {
			height: -webkit-fill-available;
		}
	</style>
</svelte:head>

<Header
	region="DATA FUTURES EXCHANGE"
	siteTitle="Static Image API"
	url="/"
	logoUrl="/assets/undp-images/undp-logo-blue.svg"
	bind:height={$headerHeight}
	isPositionFixed={true}
	bind:links
/>

<div style="margin-top: {$headerHeight}px">
	{@render children?.()}
</div>

<Footer logoUrl="/assets/undp-images/undp-logo-white.svg" bind:footerItems />

<style global lang="scss">
	@import '@undp-data/undp-bulma/dist/undp-bulma.css';

	:global(.country-header) {
		z-index: 99;
	}

	:global(.button) {
		// remove border-radius from bulma button to look like UNDP design system
		border-radius: 0;
	}
</style>
