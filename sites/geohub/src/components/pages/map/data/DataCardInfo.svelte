<script lang="ts">
	import Star from '$components/util/Star.svelte';
	import { createAttributionFromTags } from '$lib/helper';
	import type { DatasetFeature } from '$lib/types';
	import type { RasterTileMetadata, VectorTileMetadata } from '@undp-data/svelte-undp-components';
	import { CtaLink, Download } from '@undp-data/svelte-undp-design';
	import { marked } from 'marked';
	import Time from 'svelte-time';

	interface Props {
		feature: DatasetFeature;
		metadata?: RasterTileMetadata | VectorTileMetadata;
		children?: import('svelte').Snippet;
		onStarDeleted?: () => void;
	}

	let {
		feature = $bindable(),
		metadata = $bindable(),
		children,
		onStarDeleted = () => {}
	}: Props = $props();

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;

	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];

	const unit = tags?.find((t) => t.key === 'unit')?.value;

	let attribution = $state(createAttributionFromTags(tags));
	$effect(() => {
		if (metadata) {
			if (!is_raster) {
				const vectorInfo = metadata as VectorTileMetadata;
				if (vectorInfo.attribution) {
					attribution = vectorInfo.attribution;
				}
			}
		}
	});

	let isFullDescription = $state(false);
	let descriptionLength = 100;

	const downloadUrl = feature.properties.links?.find((l) => l.rel === 'download')?.href;

	const handleStarDeleted = () => {
		if (onStarDeleted) onStarDeleted();
	};
</script>

<div class="data-card-info">
	{#if feature}
		{@const stacType = feature.properties.tags?.find((t) => t.key === 'stacType')?.value}
		<div class="card-title is-flex is-flex-direction-row is-align-content-center">
			<p class="title is-5 has-text-left pr-2">{feature.properties.name}</p>
		</div>
		{#if !(stacType && ['cog', 'mosaicjson'].includes(stacType as string))}
			<div class="star py-2">
				<Star
					bind:id={feature.properties.id as string}
					bind:isStar={feature.properties.is_star as boolean}
					bind:no_stars={feature.properties.no_stars}
					ondelete={handleStarDeleted}
					table="datasets"
				/>
			</div>
		{/if}
		{@render children?.()}
		<div class="description has-text-justified">
			{#if !isFullDescription && feature.properties.description}
				{#if feature.properties.description.length < 100}
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html marked(feature.properties.description)}
				{:else}
					{feature.properties.description.substring(0, descriptionLength)}...
				{/if}
				<br />
				<CtaLink
					label="READ MORE"
					on:clicked={() => {
						isFullDescription = true;
					}}
				/>
			{:else}
				{#if feature.properties.description}
					<!-- eslint-disable svelte/no-at-html-tags -->
					<p><b>Description: </b>{@html marked(feature.properties.description)}</p>
				{/if}
				<p>
					<b>License: </b>{feature.properties.license && feature.properties.license.length > 0
						? feature.properties.license
						: 'License not specified'}
				</p>
				{#if metadata}
					{@const bandmeta = (metadata as RasterTileMetadata)['band_metadata']}
					{#if bandmeta}
						{#if bandmeta[0][1]?.RepresentationType}
							<p>
								<b>Representation Type: </b>
								{bandmeta[0][1].RepresentationType}
							</p>
						{/if}
					{/if}
				{/if}
				{#if unit}
					<p><b>Units: </b> {unit}</p>
				{/if}
				<!-- eslint-disable svelte/no-at-html-tags -->
				<p><b>Source: </b> {@html attribution}</p>
				<p>
					<b>Updated at: </b>
					<Time timestamp={feature.properties.updatedat} format="h:mm A, MMMM D, YYYY" />
				</p>
				<p>
					<b>Updated by: </b>
					{feature.properties.updated_user}
				</p>
				{#if downloadUrl}
					{@const filePath = new URL(downloadUrl).pathname.split('/')}
					{@const filename = filePath[filePath.length - 1].split('.')[0]}
					<Download title={filename} url={downloadUrl} />
				{/if}
			{/if}
		</div>
	{/if}
</div>

<style lang="scss">
	.data-card-info {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.5rem;

		.description {
			padding-bottom: 0.5rem;
		}
	}
</style>
