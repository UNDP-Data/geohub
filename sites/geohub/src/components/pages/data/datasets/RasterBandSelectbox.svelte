<script lang="ts">
	import { isRgbRaster } from '$lib/helper';
	import type { BandMetadata, RasterTileMetadata } from '$lib/types';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	export let metadata: RasterTileMetadata;
	export let selectedBand: string = undefined;
	export let disabled = false;
	export let bandsDetail: { name: string; description: string }[] = [];

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

	const getBandDescription = (index: number) => {
		const bandName = bands[index];
		let description =
			bandsDetail?.length > 0 && bandsDetail[index]
				? (bandsDetail[index].description ?? bandsDetail[index].name)
				: '';

		if (!description) {
			const bandmetas = metadata.band_metadata.map((meta) => meta[1]) as BandMetadata[];
			description = bandmetas[index].Description ?? '';
		}

		if (!description) {
			const descriptions = metadata.band_descriptions.map((b) => b[1]);
			description = descriptions[index] ?? '';
		}

		return description ? `${bandName.toUpperCase()} - ${description}` : bandName.toUpperCase();
	};
</script>

{#if !isRgbTile && bands?.length > 0}
	<div class="select is-fullwidth">
		<select bind:value={selectedBand} {disabled}>
			{#each bands as band, index}
				<option value={band}>{getBandDescription(index)}</option>
			{/each}
		</select>
	</div>
{/if}
