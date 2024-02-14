<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Breadcrumbs, { type BreadcrumbPage } from '$components/util/Breadcrumbs.svelte';
	import StacCatalogExplorer from '$components/util/stac/StacCatalogExplorer.svelte';
	import { AccessLevel, MapStyles } from '$lib/config/AppConfig';
	import {
		fromLocalStorage,
		getFirstSymbolLayerId,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type { DatasetFeature, Layer, RasterTileMetadata, StacCatalog, Tag } from '$lib/types';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import type {
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import type { PageData } from './$types';

	export let data: PageData;
	let stac = data.stac;

	let isProcessing = false;
	let datasetId = data.datasetId;
	let isRegistered = data.isRegistered;

	const generateCatalogDatasetFeature = async () => {
		const providers: Tag[] = stac.providers?.map((p) => {
			return { key: 'provider', value: p };
		});
		// const bbox = this.stacCollection.extent.spatial.bbox[0];

		// const collectionUrl = this.stacCollection.links.find((l) => l.rel === 'items').href;

		const res = await fetch(stac.url);
		const catalog: StacCatalog = await res.json();

		const bbox = [-180, -90, 180, 90];
		const feature: DatasetFeature = {
			type: 'Feature',
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[bbox[0], bbox[1]],
						[bbox[0], bbox[3]],
						[bbox[2], bbox[1]],
						[bbox[2], bbox[3]],
						[bbox[0], bbox[1]]
					]
				]
			},
			properties: {
				id: datasetId,
				name: `${catalog.title ?? stac.name}`,
				description: catalog.description ?? catalog.title ?? stac.name,
				license: catalog.license,
				url: stac.url,
				is_raster: true,
				access_level: AccessLevel.PUBLIC,
				tags: [
					{ key: 'type', value: 'stac' },
					{ key: 'stacApiType', value: 'catalog' },
					{ key: 'stacType', value: 'catalog' },
					{ key: 'stac', value: stac.id },
					...providers
				]
			}
		};
		return feature;
	};

	const handleRegister = async () => {
		isProcessing = true;
		try {
			const feature = await generateCatalogDatasetFeature();

			const formData = new FormData();
			formData.append('feature', JSON.stringify(feature));
			const res = await fetch(`${$page.url.pathname}?/register`, {
				method: 'POST',
				body: formData
			});
			if (!res.ok) {
				const message = 'Failed to complete registering';
				toast.push(message);
				throw new Error(message);
			}
			await res.json();
			isRegistered = true;
			toast.push(`The STAC catalog was registered successfully`);
		} finally {
			isProcessing = false;
		}
	};

	const handleDelete = async () => {
		isProcessing = true;
		try {
			const res = await fetch(`/api/datasets/${datasetId}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				const message = 'Failed to delete';
				toast.push(message);
				throw new Error(message);
			}
			isRegistered = false;
			toast.push(`The STAC collection was deleted successfully`);
		} finally {
			isProcessing = false;
		}
	};

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
			const firstSymbolLayerId = getFirstSymbolLayerId(storageMapStyle.layers);
			if (firstSymbolLayerId) {
				idx = storageMapStyle.layers.findIndex((l) => l.id === firstSymbolLayerId);
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

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'management', url: '/management' },
		{ title: 'stac', url: '/management/stac' },
		{ title: stac.name, url: $page.url.href }
	];
</script>

<div class="has-background-light px-6 py-4">
	<div class="py-4"><Breadcrumbs pages={breadcrumbs} /></div>

	<p class="title is-3 mt-6 mb-5 is-uppercase">{breadcrumbs[breadcrumbs.length - 1].title}</p>
</div>

<section class="ml-6 mr-4 my-4">
	{#if stac}
		{#if isRegistered}
			<button
				class="button is-link is-uppercase has-text-weight-bold {isProcessing ? 'is-loading' : ''} "
				disabled={isProcessing}
				on:click={() => {
					handleDelete();
				}}>Delete</button
			>
		{:else}
			<button
				class="button is-primary is-uppercase has-text-weight-bold {isProcessing
					? 'is-loading'
					: ''} "
				disabled={isProcessing}
				on:click={() => {
					handleRegister();
				}}>Register</button
			>
		{/if}

		<StacCatalogExplorer bind:stacId={stac.id} on:dataAdded={dataAddedToMap} />
	{/if}
</section>

<SvelteToast />
