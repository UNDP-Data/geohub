<script lang="ts">
	import { page } from '$app/stores';
	import type { StyleSpecification } from 'maplibre-gl';
	import App from '$components/App.svelte';

	$: style = $page.data?.style?.style as StyleSpecification;

	$: title = style ? `${style.name} | GeoHub` : 'GeoHub | United Nations Development Programme';
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:site_name" content={title} />
	<meta property="og:title" content={title} />
</svelte:head>
<App />
