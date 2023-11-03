<script lang="ts">
	import CircleColor from './CircleColor.svelte';
	import CircleRadius from './CircleRadius.svelte';

	export let layerId: string;
	export let defaultColor: string = undefined;
</script>

<div class="grid">
	<div>
		<div class="has-text-centered pb-2">Color</div>
		<div class="is-flex is-justify-content-center bring-to-front">
			<CircleColor {layerId} bind:defaultColor />
		</div>
	</div>
	<div>
		<div class="ml-5 pl-1 pb-2">Radius</div>
		<div class="is-flex is-justify-content-center bring-to-front">
			<CircleRadius {layerId} />
		</div>
	</div>
</div>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 5px;
	}
</style>
