<script lang="ts">
	import { AccessLevel } from '$lib/config/AppConfig';
	import type { DatasetFeature } from '$lib/types';
	import { Card, CardWithImage } from '@undp-data/svelte-undp-design';

	export let feature: DatasetFeature;
	export let width = 265;
	export let height = 150;

	const isStac = feature.properties.tags.find((t) => t.key === 'type')?.value === 'stac';
	const sdgs = feature.properties.tags.filter((t) => t.key === 'sdg_goal')?.map((t) => t.value);

	const previewUrl = feature.properties.links?.find((l) => l.rel === 'preview')?.href;

	const getTag = () => {
		return sdgs.length > 0
			? `${sdgs
					.sort((a, b) => parseInt(a) - parseInt(b))
					.slice(0, 2)
					.map((sdg) => `SDG${sdg}`)
					.join(', ')}${sdgs.length > 3 ? '...' : ''}`
			: feature.properties.is_raster
			? 'Raster'
			: 'Vector';
	};
</script>

{#if isStac}
	<Card
		title={feature.properties.name}
		description={feature.properties.description}
		url="/data/{feature.properties.id}"
		tag="Satellite"
		accent={feature.properties.access_level === AccessLevel.PRIVATE
			? 'red'
			: feature.properties.access_level === AccessLevel.ORGANIZATION
			  ? 'blue'
			  : 'yellow'}
	/>
{:else}
	<CardWithImage
		title={feature.properties.name}
		url="/data/{feature.properties.id}"
		tag={getTag()}
		image={previewUrl.replace('{width}', `${width}`).replace('{height}', `${height}`)}
		{width}
		{height}
		accent={feature.properties.access_level === AccessLevel.PRIVATE
			? 'red'
			: feature.properties.access_level === AccessLevel.ORGANIZATION
			  ? 'blue'
			  : 'yellow'}
	/>
{/if}
