<script lang="ts">
	import StacAssetExplorer from '$components/stac/StacAssetExplorer.svelte';
	import type { Layer, RasterTileMetadata, StacCollection } from '$lib/types';
	import { marked } from 'marked';
	import type { PageData } from './$types';
	import { fromLocalStorage, storageKeys, toLocalStorage } from '$lib/helper';
	import { page } from '$app/stores';
	import type {
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import { MapStyles } from '$lib/config/AppConfig';
	import { afterNavigate, goto } from '$app/navigation';
	import { base } from '$app/paths';

	// preserve previous page URL
	let previousPage: string = base;
	afterNavigate(({ from }) => {
		if (from?.url) {
			previousPage = `${from?.url.pathname}${from?.url.search}`;
		}
	});

	export let data: PageData;

	let collection: StacCollection = data.collection;

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
		const layerListStorageKey = storageKeys.layerList($page.url.host);
		const mapStyleStorageKey = storageKeys.mapStyle($page.url.host);
		const mapStyleIdStorageKey = storageKeys.mapStyleId($page.url.host);

		let storageLayerList: Layer[] | null = fromLocalStorage(layerListStorageKey, []);
		let storageMapStyle: StyleSpecification | null = fromLocalStorage(mapStyleStorageKey, {});
		let storageMapStyleId: string | undefined = fromLocalStorage(mapStyleIdStorageKey, undefined);

		// initialise local storage if they are NULL.
		if (!(storageMapStyle && Object.keys(storageMapStyle).length > 0)) {
			const res = await fetch(MapStyles[0].uri);
			const baseStyle = await res.json();
			storageMapStyle = baseStyle;
		}
		if (!storageLayerList) {
			storageLayerList = [];
		}

		let dataArray = e.detail.layers;

		for (const data of dataArray) {
			storageLayerList = [data.geohubLayer, ...storageLayerList];

			let idx = storageMapStyle.layers.length - 1;
			for (const layer of storageMapStyle.layers) {
				if (layer.type === 'symbol') {
					idx = storageMapStyle.layers.indexOf(layer);
					break;
				}
			}
			storageMapStyle.layers.splice(idx, 0, data.layer);

			if (!storageMapStyle.sources[data.sourceId]) {
				storageMapStyle.sources[data.sourceId] = data.source;
			}
		}

		// save layer info to localstorage
		toLocalStorage(mapStyleStorageKey, storageMapStyle);
		toLocalStorage(layerListStorageKey, storageLayerList);

		// move to /map page
		const url = `/map${storageMapStyleId ? `/${storageMapStyleId}` : ''}`;
		goto(url, { invalidateAll: true });
	};
</script>

<section class=" p-4">
	{#if previousPage}
		<div class="mb-4">
			<a type="button" class="button is-link" href={previousPage}> Back to previous page </a>
		</div>
	{/if}

	<h1 class="title is-1">{collection.title}</h1>

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

		<StacAssetExplorer
			stacId={data.stacType}
			collection={collection.id}
			on:dataAdded={dataAddedToMap}
		/>
	</div>
</section>
