<script lang="ts">
	import HeatmapColor from '$components/controls/vector-styles/HeatmapColor.svelte';
	import HeatmapIntensity from '$components/controls/vector-styles/HeatmapIntensity.svelte';
	import HeatmapRadius from '$components/controls/vector-styles/HeatmapRadius.svelte';
	import HeatmapWeight from '$components/controls/vector-styles/HeatmapWeight.svelte';
	import type { Layer } from '$lib/types';

	export let layer: Layer;
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
					<HeatmapIntensity {layer} />
				</div>
			</div>
		</div>
		<div class="columns is-mobile">
			<div class="column pb-0">
				<div class="has-text-centered pb-2">Heatmap Radius</div>
				<div class="is-flex is-justify-content-center">
					<HeatmapRadius {layer} />
				</div>
			</div>
		</div>
		<div class="columns is-mobile">
			<div class="column pb-0">
				<div class="has-text-centered pb-2">Heatmap Weight</div>
				<div class="is-flex is-justify-content-center">
					<HeatmapWeight {layer} />
				</div>
			</div>
		</div>
	</div>
</div>
