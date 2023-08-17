<script lang="ts">
	import MiniMap from '$components/data-view/MiniMap.svelte';
	import { isRasterExtension } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { CtaLink } from '@undp-data/svelte-undp-design';

	export let isLoadMap = false;

	export let id: string;
	export let url: string;
	let feature: DatasetFeature = undefined;

	let isPmtiles = url.indexOf('.pmtiles') !== -1 ? true : false;

	if (!feature) {
		// if no feature is given, create feature object with minimum property
		feature = {
			type: 'Feature',
			properties: {
				id,
				url: isPmtiles ? `pmtiles://${url}` : url,
				is_raster: isRasterExtension(url.split('?')[0])
			}
		};
	}

	const handleLinkClicked = () => {
		const viewerUrl = `https://undp-data.github.io/PMTiles?url=${encodeURIComponent(url)}`;
		window.open(viewerUrl, '_blank');
	};
</script>

<div>
	<MiniMap bind:feature bind:isLoadMap width="370px" height="250px" />

	{#if isPmtiles}
		<div class="mt-2">
			<CtaLink label="See more details" isArrow={false} on:clicked={handleLinkClicked} />
		</div>
	{/if}
</div>
