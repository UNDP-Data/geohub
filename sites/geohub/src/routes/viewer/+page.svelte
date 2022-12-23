<script lang="ts">
  import StyleViewer from '@undp-data/style-viewer'
  import { PUBLIC_AZURE_URL } from '$lib/variables/public'
</script>

<svelte:head>
  <title>Geohub | Simple Map Viewer</title>
</svelte:head>

<StyleViewer azureBaseUrl={PUBLIC_AZURE_URL} />
