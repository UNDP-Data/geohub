<script lang="ts">
	import { isRgbRaster } from '$lib/helper';
	import type { RasterTileMetadata } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let metadata: RasterTileMetadata;
	export let selectedBand: string = undefined;
	export let disabled = false;

	let bands: string[] = undefined;

	const isRgbTile = isRgbRaster(metadata.colorinterp);

	$: selectedBand, setActiveBand();
	const setActiveBand = () => {
		if (!metadata) return;
		if (metadata?.isMosaicJson) return;
		if (metadata.active_band_no === selectedBand) return;

		metadata.active_band_no === selectedBand;

		dispatch('change', {
			active_band_no: metadata.active_band_no
		});
	};

	selectedBand = metadata.active_band_no;
	if (metadata.band_metadata.length > 0) {
		bands = metadata.band_metadata.map((meta) => meta[0]) as string[];
	}
</script>

{#if !isRgbTile && bands?.length > 0}
	<div class="select is-fullwidth">
		<select bind:value={selectedBand} {disabled}>
			{#each bands as band}
				<option value={band}>B{band}</option>
			{/each}
		</select>
	</div>
{/if}
