<script lang="ts">
	import { page } from '$app/stores';
	import { SiteInfo } from '$lib/config/AppConfig';

	let title = $page.data.title ?? 'GeoHub';
	let content = $page.data.content ?? 'GeoHub';
	let site_name = $page.data.site_name ?? SiteInfo.site_name;
	let site_description = $page.data.site_description ?? SiteInfo.site_description;
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={site_name} />
	<meta property="og:type" content="article" />
	<meta name="description" content={site_description} />
	<meta property="og:description" content={site_description} />
	<meta name="twitter:description" content={site_description} />
	<meta property="og:title" content={title} />
	<meta property="og:image" content="{$page.url.origin}/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="{$page.url.origin}/api/og?content={content}" />
	<meta property="og:url" content="{$page.url.origin}{$page.url.pathname}" />
</svelte:head>

<slot />
