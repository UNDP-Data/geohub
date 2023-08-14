<script lang="ts">
	import Settings from '$components/Settings.svelte';

	let title = 'Settings | GeoHub';
	let content = 'Settings';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={title} />
	<meta property="og:image" content="/api/og?content={content}" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:image" content="/api/og?content={content}" />
</svelte:head>

<div class="main-section p-4">
	<Settings />
</div>
