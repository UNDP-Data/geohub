<script lang="ts">
	import HeatmapColor from '$components/maplibre/heatmap/HeatmapColor.svelte';

	export let layerId: string;
</script>

<HeatmapColor {layerId} />
