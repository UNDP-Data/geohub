<script lang="ts">
	import { AccessLevel } from '$lib/config/AppConfig';
	import { getAccessLevelIcon } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import { Card, CardWithImage } from '@undp-data/svelte-undp-design';

	interface Props {
		feature: DatasetFeature;
		width?: number;
		height?: number;
	}

	let { feature = $bindable(), width = $bindable(265), height = $bindable(150) }: Props = $props();

	const isStac = feature.properties.tags?.find((t) => t.key === 'type')?.value === 'stac';
	const sdgs = feature.properties.tags?.filter((t) => t.key === 'sdg_goal')?.map((t) => t.value);

	const previewUrl = feature.properties.links?.find((l) => l.rel === 'preview')?.href;

	const getTag = () => {
		return sdgs && sdgs.length > 0
			? `${sdgs
					.sort((a, b) => parseInt(a as string) - parseInt(b as string))
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
		title={feature.properties.name as string}
		description={feature.properties.description as string}
		url="/data/{feature.properties.id}"
		tag="Satellite"
		accent={feature.properties.access_level === AccessLevel.PRIVATE
			? 'red'
			: feature.properties.access_level === AccessLevel.ORGANIZATION
				? 'blue'
				: 'yellow'}
	/>
{:else}
	{@const accessIcon = getAccessLevelIcon(feature.properties.access_level, true)}
	<CardWithImage
		title={feature.properties.name as string}
		url="/data/{feature.properties.id}"
		tag={getTag()}
		image={previewUrl?.replace('{width}', `${width}`).replace('{height}', `${height}`) as string}
		{width}
		{height}
		accent={feature.properties.access_level === AccessLevel.PRIVATE
			? 'red'
			: feature.properties.access_level === AccessLevel.ORGANIZATION
				? 'blue'
				: 'yellow'}
		icon={accessIcon}
	/>
{/if}
