<script lang="ts">
	import IconColor from '$components/maplibre/symbol/IconColor.svelte';
	import IconImage from '$components/maplibre/symbol/IconImage.svelte';
	import IconOverlap from '$components/maplibre/symbol/IconOverlap.svelte';
	import IconSize from '$components/maplibre/symbol/IconSize.svelte';

	export let layerId: string;
	export let defaultColor: string = undefined;
</script>

<div class="columns is-mobile px-4 py-2">
	<div class="column is-flex is-justify-content-center p-0 m-0">
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label has-text-centered">Icon</label>
			<div class="control">
				<IconImage {layerId} bind:defaultColor />
			</div>
		</div>
	</div>
	<div class="column is-flex is-justify-content-center p-0 m-0">
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label has-text-centered">Overlap Priority</label>
			<div class="control pt-1">
				<IconOverlap {layerId} />
			</div>
		</div>
	</div>
</div>
<div class="columns is-mobile px-4 py-2">
	<div class="column is-flex is-justify-content-center p-0 m-0">
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label has-text-centered">Color</label>
			<div class="control pl-2">
				<IconColor {layerId} bind:defaultColor />
			</div>
		</div>
	</div>
	<div class="column is-flex is-justify-content-center p-0 m-0">
		<div class="field">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			<label class="label has-text-centered">Size</label>
			<div class="control">
				<IconSize {layerId} />
			</div>
		</div>
	</div>
</div>
