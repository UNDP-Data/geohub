<script lang="ts">
	import type { RasterTileMetadata, Tag } from '$lib/types';
	import { Histogram } from '@undp-data/svelte-undp-components';
	import { onMount } from 'svelte';
	export let metadata: RasterTileMetadata;
	export let tags: Tag[];

	let counts: number[];
	let bins: number[];
	let unit: string;

	onMount(() => {
		const band = metadata.active_band_no;
		if (metadata.stats && band) {
			counts = metadata.stats[band]['histogram'][0];
			bins = metadata.stats[band]['histogram'][1];
		}

		unit = (tags.find((tag) => tag.key === 'unit')?.value as string) ?? 'Intervals';
	});
</script>

{#if counts && counts.length > 0}
	<Histogram bind:counts bind:bins bind:xLabel={unit} bind:unit yLabel="Pixels" />
{/if}
