<script lang="ts">
	import HeatmapColor from '$components/maplibre/heatmap/HeatmapColor.svelte';
	import HeatmapIntensity from '$components/maplibre/heatmap/HeatmapIntensity.svelte';
	import HeatmapRadius from '$components/maplibre/heatmap/HeatmapRadius.svelte';
	import HeatmapWeight from '$components/maplibre/heatmap/HeatmapWeight.svelte';
	import type { Layer } from '$lib/types';

	export let layer: Layer;

	let layerId = layer.id;
</script>

<div class="columns is-mobile">
	<div class="column">
		<div class="has-text-centered pb-2">Heatmap Color</div>
		<div>
			<HeatmapColor {layer} />
		</div>
	</div>
	<div class="column">
		<div class="columns is-mobile">
			<div class="column pb-0">
				<div class="has-text-centered pb-2">Heatmap Intensity</div>
				<div class="is-flex is-justify-content-center">
					<HeatmapIntensity {layerId} />
				</div>
			</div>
		</div>
		<div class="columns is-mobile">
			<div class="column pb-0">
				<div class="has-text-centered pb-2">Heatmap Radius</div>
				<div class="is-flex is-justify-content-center">
					<HeatmapRadius {layerId} />
				</div>
			</div>
		</div>
		<div class="columns is-mobile">
			<div class="column pb-0">
				<div class="has-text-centered pb-2">Heatmap Weight</div>
				<div class="is-flex is-justify-content-center">
					<HeatmapWeight {layerId} />
				</div>
			</div>
		</div>
	</div>
</div>
