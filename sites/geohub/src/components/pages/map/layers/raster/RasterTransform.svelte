<script lang="ts">
	import RasterTransformAdvanced from '$components/pages/map/layers/raster/RasterTransformAdvanced.svelte';
	import RasterTransformSimple from '$components/pages/map/layers/raster/RasterTransformSimple.svelte';
	import type { Layer } from '$lib/types';
	import { SegmentButtons, type SegmentButton } from '@undp-data/svelte-undp-components';

	export let layer: Layer;

	let buttons: SegmentButton[] = [
		{ title: 'Simple', value: 'Simple', icon: 'fa-solid fa-thumbs-up' },
		{ title: 'Advanced', value: 'Advanced', icon: 'fa-solid fa-magnifying-glass-plus' }
	];

	let activeButton = buttons[0].value;
</script>

<div class="is-flex is-justify-content-center mb-2">
	<SegmentButtons bind:buttons bind:selected={activeButton} size="normal" />
</div>

{#if activeButton === 'Simple'}
	<RasterTransformSimple bind:layer />
{:else if activeButton === 'Advanced'}
	<RasterTransformAdvanced bind:layer />
{/if}
