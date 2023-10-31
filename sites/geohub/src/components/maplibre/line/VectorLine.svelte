<script lang="ts">
	import LineColor from '$components/maplibre/line/LineColor.svelte';
	import LineWidth from '$components/maplibre/line/LineWidth.svelte';

	export let layerId: string;
	export let defaultColor: string = undefined;
</script>

<div class="grid">
	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label has-text-centered">Color</label>
		<div class="control is-flex is-justify-content-center">
			<LineColor {layerId} bind:defaultColor />
		</div>
	</div>
	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label ml-5">Width</label>
		<div class="control">
			<LineWidth {layerId} />
		</div>
	</div>
</div>

<style lang="scss">
	.grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
	}
</style>
