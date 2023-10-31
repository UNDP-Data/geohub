<script lang="ts">
	import LineColor from '$components/maplibre/line/LineColor.svelte';

	export let layerId: string;
	export let defaultColor: string = undefined;
</script>

<div class="is-flex is-justify-content-center p-0 m-0">
	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label has-text-centered">Color</label>
		<div class="control pl-2">
			<LineColor {layerId} bind:defaultColor />
		</div>
	</div>
</div>
