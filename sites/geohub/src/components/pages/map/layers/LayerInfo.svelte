<script lang="ts">
	import Star from '$components/util/Star.svelte';
	import { createAttributionFromTags, isRgbRaster } from '$lib/helper';
	import type { Layer } from '$lib/types';
	import {
		Accordion,
		FieldControl,
		Histogram,
		initTooltipTippy,
		type RasterTileMetadata
	} from '@undp-data/svelte-undp-components';
	import { CtaLink } from '@undp-data/svelte-undp-design';
	import { filesize } from 'filesize';
	import { marked } from 'marked';
	import { onMount } from 'svelte';
	import Time from 'svelte-time';

	interface Props {
		layer: Layer;
	}

	let { layer = $bindable() }: Props = $props();

	const tippyTooltip = initTooltipTippy();

	let isFullDescription = $state(false);
	let properties = $state(layer.dataset?.properties);

	let counts: number[] = $state([]);
	let bins: number[] = $state([]);
	let unit: string = $state('');

	const tags: [{ key: string; value: string }] = properties?.tags as unknown as [
		{ key: string; value: string }
	];
	const stacType = tags?.find((t) => t.key === 'stacType')?.value;
	const datasetUrl = properties?.links?.find((l) => l.rel === 'dataset')?.href;
	const downloadUrl = properties?.links?.find((l) => l.rel === 'download')?.href;

	const rasterInfo: RasterTileMetadata = layer.info as RasterTileMetadata;

	const getFileSize = async (url: string) => {
		let bytes = 'N/A';
		const res = await fetch(url);
		if (res.ok) {
			const contentLength = res.headers.get('content-length');
			if (contentLength) {
				bytes = filesize(Number(contentLength), { round: 1 }) as string;
			}
		}
		return bytes;
	};

	let expanded: { [key: string]: boolean } = $state({
		metadata: true
	});
	// to allow only an accordion to be expanded
	let expandedDatasetId: string = $state('');
	$effect(() => {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	});

	onMount(() => {
		if (properties?.is_raster === true) {
			const isRgbTile = rasterInfo.colorinterp ? isRgbRaster(rasterInfo.colorinterp) : false;
			if (!isRgbTile) {
				const band = rasterInfo.active_band_no;
				if (rasterInfo.stats && band) {
					counts = rasterInfo.stats[band]['histogram'][0];
					bins = rasterInfo.stats[band]['histogram'][1];
				}

				unit = (tags.find((tag) => tag.key === 'unit')?.value as string) ?? 'Intervals';
			}
		}
	});
</script>

<Accordion title="Metadata" bind:isExpanded={expanded['metadata']}>
	{#snippet content()}
		<div>
			<div class="pb-2 is-flex is-align-items-center">
				<span class="dataset-title is-size-5 has-text-weight-semibold">{properties?.name}</span>
				{#if datasetUrl}
					<a
						href={datasetUrl}
						target="_blank"
						class="copy-button button ml-auto has-text-link"
						use:tippyTooltip={{ content: 'Open this dataset page' }}
						aria-label="copy"
					>
						<span class="icon is-small">
							<i class="fa-solid fa-arrow-up-right-from-square"></i>
						</span>
					</a>
				{/if}
			</div>

			{#if !(stacType && ['cog', 'mosaicjson'].includes(stacType)) || downloadUrl}
				<div class="is-flex is-align-items-center pb-2">
					{#if !(stacType && ['cog', 'mosaicjson'].includes(stacType)) && properties}
						<div class="pr-1">
							<Star
								bind:id={properties.id as string}
								bind:isStar={properties.is_star as boolean}
								bind:no_stars={properties.no_stars}
								table="datasets"
							/>
						</div>
					{/if}
					{#if downloadUrl}
						{@const filePath = new URL(downloadUrl).pathname.split('/')}
						{#await getFileSize(downloadUrl) then bytes}
							<a class="button is-small" href={downloadUrl} target="_blank">
								<span class="icon">
									<i class="fas fa-download"></i>
								</span>
								<span
									>{`${filePath[filePath.length - 1].split('.')[1].toUpperCase()} (${bytes})`}</span
								>
							</a>
						{/await}
					{/if}
				</div>
			{/if}

			<div class="is-size-6 has-text-justified {isFullDescription ? '' : 'short-description'}">
				{#if properties?.description}
					<!-- eslint-disable svelte/no-at-html-tags -->
					{@html marked(properties.description)}
				{/if}
			</div>

			{#if !isFullDescription}
				<div class="mt-4 mb-2">
					<CtaLink
						label="READ MORE"
						onclick={() => {
							isFullDescription = true;
						}}
					/>
				</div>
			{:else}
				<FieldControl title="license" showHelp={false}>
					{#snippet control()}
						<div class="is-size-6">
							{properties?.license ?? 'License not specified'}
						</div>
					{/snippet}
				</FieldControl>
				<FieldControl title="source" showHelp={false}>
					{#snippet control()}
						<div class="is-size-6">
							<!-- eslint-disable svelte/no-at-html-tags -->
							{@html createAttributionFromTags(tags)}
						</div>
					{/snippet}
				</FieldControl>

				<FieldControl title="created at" showHelp={false}>
					{#snippet control()}
						<div>
							<Time timestamp={properties?.createdat} format="h:mm A, MMMM D, YYYY" />
						</div>
					{/snippet}
				</FieldControl>
				{#if properties?.created_user}
					<FieldControl title="created by" showHelp={false}>
						{#snippet control()}
							<div class="is-size-6">
								{properties.created_user}
							</div>
						{/snippet}
					</FieldControl>
				{/if}

				{#if properties?.updatedat}
					<FieldControl title="updated at" showHelp={false}>
						{#snippet control()}
							<div>
								<Time timestamp={properties.updatedat} format="h:mm A, MMMM D, YYYY" />
							</div>
						{/snippet}
					</FieldControl>
				{/if}
				{#if properties?.updated_user}
					<FieldControl title="updated by" showHelp={false}>
						{#snippet control()}
							<div class="is-size-6">
								{properties.updated_user}
							</div>
						{/snippet}
					</FieldControl>
				{/if}
			{/if}
		</div>
	{/snippet}
</Accordion>

{#if properties?.is_raster}
	{@const isRgbTile = rasterInfo.colorinterp ? isRgbRaster(rasterInfo.colorinterp) : false}
	{#if !isRgbTile && counts && counts.length > 0}
		<Accordion title="Dataset statistics" bind:isExpanded={expanded['statistics']}>
			{#snippet content()}
				<div class="pb-4">
					<Histogram bind:counts bind:bins bind:xLabel={unit} bind:unit yLabel="Pixels" />
				</div>
			{/snippet}
		</Accordion>
	{/if}
{/if}

<style lang="scss">
	.dataset-title {
		word-break: break-all;
	}

	.short-description {
		overflow: hidden;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3;
	}

	.copy-button {
		&.button {
			border: none;
			background: transparent;
			box-shadow: none;
		}
	}
</style>
