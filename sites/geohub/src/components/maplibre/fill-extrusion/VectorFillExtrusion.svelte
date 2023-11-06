<script lang="ts">
	import FillExtrusionColor from './FillExtrusionColor.svelte';

	export let layerId: string;
	export let defaultFillColor: string = undefined;
</script>

<div class="line-simple-container" data-testid="polygon-simple-container">
	<div class="columns is-mobile">
		<div class="column is-5">
			<div class="has-text-centered pb-2">Color</div>
			<div class="is-flex is-justify-content-center bring-to-front">
				<FillExtrusionColor {layerId} bind:defaultColor={defaultFillColor} />
			</div>
		</div>
	</div>
</div>
