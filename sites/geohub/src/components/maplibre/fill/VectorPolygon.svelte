<script lang="ts">
	import FillColor from '$components/maplibre/fill/FillColor.svelte';
	import FillOutlineColor from '$components/maplibre/fill/FillOutlineColor.svelte';

	export let layerId: string;
	export let defaultFillColor: string = undefined;
	export let defaultFillOutlineColor: string = undefined;
</script>

<div class="line-simple-container" data-testid="polygon-simple-container">
	<div class="columns is-mobile">
		<div class="column is-5">
			<div class="has-text-centered pb-2">Fill Color</div>
			<div class="is-flex is-justify-content-center bring-to-front">
				<FillColor {layerId} bind:defaultColor={defaultFillColor} />
			</div>
		</div>
		<div class="column is-7">
			<div class="has-text-centered pb-2">Fill Outline Color</div>
			<div class="is-flex is-justify-content-center send-to-back">
				<FillOutlineColor {layerId} bind:defaultColor={defaultFillOutlineColor} />
			</div>
		</div>
	</div>
</div>
