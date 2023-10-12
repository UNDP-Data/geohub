<script lang="ts">
	import MiniMap from '$components/data-view/MiniMap.svelte';
	import type { DatasetFeature } from '$lib/types';
	import { CtaLink } from '@undp-data/svelte-undp-design';

	export let isLoadMap = false;

	export let url: string;
	export let feature: DatasetFeature;

	let isPmtiles = url.indexOf('.pmtiles') !== -1 ? true : false;
</script>

<div>
	{#if feature}
		<MiniMap bind:feature bind:isLoadMap width="370px" height="250px" />
	{/if}
	{#if isPmtiles}
		<div class="mt-2">
			<CtaLink
				label="See more details"
				isArrow={false}
				href={`https://protomaps.github.io/PMTiles?url=${encodeURIComponent(url)}`}
				target="_blank"
			/>
		</div>
	{/if}
</div>
