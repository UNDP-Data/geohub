<script lang="ts">
	import Accordion from '$components/util/Accordion.svelte';
	import FieldControl from '$components/util/FieldControl.svelte';
	import Star from '$components/util/Star.svelte';
	import { createAttributionFromTags, isRgbRaster } from '$lib/helper';
	import type { Layer, RasterTileMetadata } from '$lib/types';
	import { filesize } from 'filesize';
	import Time from 'svelte-time/src/Time.svelte';
	import RasterHistogram from './raster/RasterHistogram.svelte';

	export let layer: Layer;

	let properties = layer.dataset.properties;
	const tags: [{ key: string; value: string }] = properties.tags as unknown as [
		{ key: string; value: string }
	];
	const stacType = tags?.find((t) => t.key === 'stacType')?.value;
	const downloadUrl = properties.links?.find((l) => l.rel === 'download')?.href;

	const rasterInfo: RasterTileMetadata = layer.info;

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

	let expanded: { [key: string]: boolean } = {
		metadata: true
	};
	// to allow only an accordion to be expanded
	let expandedDatasetId: string;
	$: {
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
	}
</script>

<Accordion title="Metadata" bind:isExpanded={expanded['metadata']}>
	<div slot="content">
		<div class="is-size-5 has-text-weight-semibold pb-3">
			{properties.name}
		</div>

		{#if !(stacType && ['cog', 'mosaicjson'].includes(stacType)) || downloadUrl}
			<div class="is-flex is-align-items-center pb-2">
				{#if !(stacType && ['cog', 'mosaicjson'].includes(stacType))}
					<div class="pr-1">
						<Star
							bind:id={properties.id}
							bind:isStar={properties.is_star}
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

		<div class="is-size-6 pb-2">
			{properties.description}
		</div>
		<FieldControl title="license" showHelp={false}>
			<div class="is-size-6" slot="control">
				{properties.license ?? 'License not specified'}
			</div>
		</FieldControl>
		<FieldControl title="source" showHelp={false}>
			<div class="is-size-6" slot="control">
				<!-- eslint-disable svelte/no-at-html-tags -->
				{@html createAttributionFromTags(tags)}
			</div>
		</FieldControl>

		<FieldControl title="created at" showHelp={false}>
			<div slot="control">
				<Time timestamp={properties.createdat} format="h:mm A, MMMM D, YYYY" />
			</div>
		</FieldControl>
		<FieldControl title="created by" showHelp={false}>
			<div class="is-size-6" slot="control">
				{properties.created_user}
			</div>
		</FieldControl>

		{#if properties.updated_user}
			<FieldControl title="updated at" showHelp={false}>
				<div slot="control">
					<Time timestamp={properties.updatedat} format="h:mm A, MMMM D, YYYY" />
				</div>
			</FieldControl>
			<FieldControl title="updated by" showHelp={false}>
				<div class="is-size-6" slot="control">
					{properties.updated_user}
				</div>
			</FieldControl>
		{/if}
	</div>
</Accordion>

{#if properties.is_raster}
	{@const isRgbTile = isRgbRaster(rasterInfo.colorinterp)}
	{#if !isRgbTile}
		<Accordion title="Dataset statistics" bind:isExpanded={expanded['statistics']}>
			<div slot="content">
				<RasterHistogram bind:metadata={layer.info} />
			</div>
		</Accordion>
	{/if}
{/if}