<script lang="ts">
	import type { DatasetFeature } from '$lib/types';
	import { Card, CardWithImage } from '@undp-data/svelte-undp-design';

	export let feature: DatasetFeature;

	const isStac = feature.properties.tags.find((t) => t.key === 'type')?.value === 'stac';
</script>

{#if isStac}
	<Card
		title={feature.properties.name}
		description={feature.properties.description}
		url="/data/{feature.properties.id}"
		tag="Satellite"
	/>
{:else}
	{@const sdgs = feature.properties.tags.filter((t) => t.key === 'sdg_goal')?.map((t) => t.value)}
	<CardWithImage
		title={feature.properties.name}
		url="/data/{feature.properties.id}"
		tag={sdgs.length > 0
			? `${sdgs
					.sort((a, b) => parseInt(a) - parseInt(b))
					.slice(0, 2)
					.map((sdg) => `SDG${sdg}`)
					.join(', ')}${sdgs.length > 3 ? '...' : ''}`
			: feature.properties.is_raster
			  ? 'Raster'
			  : 'Vector'}
		image="/api/datasets/{feature.properties.id}/preview/auto/265x150.webp"
		accent="yellow"
	/>
{/if}
