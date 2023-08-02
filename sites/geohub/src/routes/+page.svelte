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

	<style type="text/css">
		html,
		body {
			margin: 0;
			padding: 0;
			min-height: 100vh;
			/* mobile viewport bug fix */
			min-height: -webkit-fill-available;
			font-family: ProximaNova, sans-serif;
			font-size: 13px;
		}

		html {
			overflow-y: hidden !important;
			height: -webkit-fill-available;
		}
	</style>
</svelte:head>
<App />
