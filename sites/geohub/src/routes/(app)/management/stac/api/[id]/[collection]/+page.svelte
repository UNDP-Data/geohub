<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import StacApiExplorer from '$components/util/stac/StacApiExplorer.svelte';
	import { addDataToLocalStorage, getFirstSymbolLayerId } from '$lib/helper';
	import type { Layer, RasterTileMetadata, StacCollection } from '$lib/types';
	import { HeroHeader, type BreadcrumbPage } from '@undp-data/svelte-undp-components';
	import type {
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import { marked } from 'marked';
	import type { PageData } from './$types';

	export let data: PageData;

	let collection: StacCollection = data.collection;
	let stac = data.stac;
	let dataset = data.dataset;

	console.log(data);
	let thumbnail = collection.assets?.thumbnail;

	const dataAddedToMap = async (e: {
		detail: {
			layers: [
				{
					geohubLayer: Layer;
					layer: RasterLayerSpecification;
					source: RasterSourceSpecification;
					sourceId: string;
					metadata: RasterTileMetadata;
					colormap: string;
				}
			];
		};
	}) => {
		const mapUrl = await addDataToLocalStorage(
			$page.url,
			(layers: Layer[], style: StyleSpecification, styleId: string) => {
				let dataArray = e.detail.layers;
				for (const data of dataArray) {
					layers = [data.geohubLayer, ...layers];
					let idx = style.layers.length - 1;
					const firstSymbolLayerId = getFirstSymbolLayerId(style.layers);
					if (firstSymbolLayerId) {
						idx = style.layers.findIndex((l) => l.id === firstSymbolLayerId);
					}
					style.layers.splice(idx, 0, data.layer);
					if (!style.sources[data.sourceId]) {
						style.sources[data.sourceId] = data.source;
					}
				}

				return { layers, style, styleId };
			}
		);

		// move to /map page
		goto(mapUrl.url, { invalidateAll: true });
	};

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'management', url: '/management' },
		{ title: 'stac', url: '/management/stac' },
		{ title: stac.name, url: `/management/stac/${stac.id}` },
		{ title: collection.title, url: $page.url.href }
	];
</script>

<HeroHeader title={breadcrumbs[breadcrumbs.length - 1].title} bind:breadcrumbs />

<section class="m-6">
	<div class="columns">
		{#if thumbnail}
			<div class="column is-6">
				<img src={thumbnail.href} alt={thumbnail.title} />
			</div>
		{/if}
		<div class="column is-6">
			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">ID</label>
				<div class="control">
					<p>{collection.id}</p>
				</div>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">STAC Link</label>
				<div class="control">
					<a href={collection.links.find((l) => l.rel === 'self').href} target="_blank">
						Collection API
					</a>
				</div>
			</div>

			<div class="field">
				<!-- svelte-ignore a11y-label-has-associated-control -->
				<label class="label">Description</label>
				<div class="control">
					<!-- eslint-disable svelte/no-at-html-tags -->
					<p>{@html marked(collection.description)}</p>
				</div>
			</div>
		</div>
	</div>

	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">License</label>
		<div class="control">
			<p>{collection.license}</p>
		</div>
	</div>

	<div class="field">
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="label">Providers</label>
		<div class="control">
			{#each collection.providers as provider, index}
				{#if index > 0}
					,
				{/if}
				<a href={provider.url} target="_blank">{provider.name}</a>
			{/each}
		</div>
	</div>

	<div class="my-4">
		<p class="title is-5">STAC data explorer</p>

		<StacApiExplorer
			bind:dataset
			stacId={data.stac.id}
			collection={collection.id}
			on:dataAdded={dataAddedToMap}
		/>
	</div>
</section>
