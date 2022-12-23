<script lang="ts">
	import StyleViewer from '$lib';
	import { PUBLIC_AZURE_URL } from '$env/static/public';

	const title = 'Geohub Simple Map Viewer';
</script>

<sveltekit:head>
	<title>{title}</title>
</sveltekit:head>

<div>
	<StyleViewer azureBaseUrl={PUBLIC_AZURE_URL} />
</div>
