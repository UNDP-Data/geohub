<script lang="ts">
	import { page } from '$app/stores';
	import Settings from '$components/Settings.svelte';
	import { SiteInfo } from '$lib/config/AppConfig';
	import { SvelteToast } from '@zerodevx/svelte-toast';

	let title = 'Settings | GeoHub';
	let content = 'Settings';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={SiteInfo.site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={SiteInfo.site_description} />
	<meta property="og:description" content={SiteInfo.site_description} />
	<meta name="twitter:description" content={SiteInfo.site_description} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="/api/og?content={content}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
</svelte:head>

<div class="main-section p-4">
	<Settings />
</div>

<SvelteToast />
