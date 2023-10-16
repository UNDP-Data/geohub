<script lang="ts">
	import LineColor from '$components/maplibre/line/LineColor.svelte';
	import LinePattern from '$components/maplibre/line/LinePattern.svelte';
	import LineWidth from '$components/maplibre/line/LineWidth.svelte';
	import type { Layer } from '$lib/types';

	export let layer: Layer;
	export let defaultColor: string = undefined;
	export let showLineColor = true;
	export let showLineWidth = true;
</script>

<div class="columns is-mobile">
	<div class="column">
		<div class="is-flex is-justify-content-center p-0 m-0" style="width: 170px;">
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label has-text-centered">Line Pattern</label>
				<div class="control">
					<LinePattern bind:layer bind:defaultColor />
				</div>
			</div>
		</div>
	</div>
	<div class="column p-0 m-0">
		<div class="tile is-vertical is-parent">
			{#if showLineColor}
				<div class="tile is-child">
					<div class="is-flex is-justify-content-center p-0 m-0">
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label has-text-centered">Color</label>
							<div class="control pl-2">
								<LineColor bind:layer bind:defaultColor />
							</div>
						</div>
					</div>
				</div>
			{/if}
			{#if showLineWidth}
				<div class="tile is-child">
					<div class="is-flex is-justify-content-center p-0 m-0">
						<div class="field">
							<!-- svelte-ignore a11y-label-has-associated-control -->
							<label class="label has-text-centered">Width</label>
							<div class="control">
								<LineWidth bind:layer />
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>
