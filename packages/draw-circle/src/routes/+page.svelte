<script lang="ts">
	import Map from '$example/components/Map.svelte';
</script>

<sveltekit:head>
	<title>Svelte maplibre draw circle example</title>

	<!-- Material Icons -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
	<!-- Roboto -->
	<link
		rel="stylesheet"
		href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700"
	/>
	<!-- Roboto Mono -->
	<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono" />

	<link
		rel="stylesheet"
		href="https://cdn.jsdelivr.net/npm/svelte-material-ui@6.0.0/bare.min.css"
	/>

	<style type="text/css">
		html,
		body {
			margin: 0;
			font-family: ProximaNova, sans-serif;
			font-size: 13px;
		}

		html {
			overflow-y: hidden !important;
		}

		.mdc-drawer {
			width: 355px;
		}

		.mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing) + .mdc-drawer-app-content {
			margin-left: 355px;
			margin-right: 0;
		}
	</style>
</sveltekit:head>

<Map />
