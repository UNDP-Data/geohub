<script lang="ts">
	import { isRgbRaster } from '$lib/helper';
	import type { BandMetadata, RasterTileMetadata } from '@undp-data/svelte-undp-components';
	import { onMount } from 'svelte';

	interface Props {
		metadata: RasterTileMetadata;
		selectedBand?: string;
		disabled?: boolean;
		bandsDetail?: { name: string; description: string }[];
		onchange?: () => void;
	}

	let {
		metadata = $bindable(),
		selectedBand = $bindable(undefined),
		disabled = $bindable(false),
		bandsDetail = $bindable([]),
		onchange = () => {}
	}: Props = $props();

	let bands: string[] | undefined = $state();

	const isRgbTile = isRgbRaster(metadata.colorinterp as string[]);

	const setActiveBand = () => {
		if (!metadata) return;
		if (metadata?.isMosaicJson) return;
		if (metadata.active_band_no === selectedBand) return;

		metadata.active_band_no === selectedBand;

		if (onchange) onchange();
	};

	selectedBand = metadata.active_band_no;
	if (metadata.band_metadata && metadata.band_metadata.length > 0) {
		bands = metadata.band_metadata.map((meta) => meta[0]) as string[];
	}

	const getBandDescription = (index: number) => {
		if (!bands) return '';
		const bandName = bands[index];
		let description =
			bandsDetail?.length > 0 && bandsDetail[index]
				? (bandsDetail[index].description ?? bandsDetail[index].name)
				: '';

		if (!description) {
			const bandmetas = metadata.band_metadata?.map((meta) => meta[1]) as BandMetadata[];
			description = bandmetas[index].Description ?? '';
		}

		if (!description) {
			const descriptions = metadata.band_descriptions?.map((b) => b[1]);
			if (descriptions) {
				description = descriptions[index] ?? '';
			}
		}

		return description ? `${bandName.toUpperCase()} - ${description}` : bandName.toUpperCase();
	};

	onMount(() => {
		setActiveBand();
	});
</script>

{#if !isRgbTile && bands && bands.length > 0}
	<div class="select is-fullwidth">
		<select bind:value={selectedBand} {disabled} onchange={setActiveBand}>
			{#each bands as band, index}
				<option value={band}>{getBandDescription(index)}</option>
			{/each}
		</select>
	</div>
{/if}
