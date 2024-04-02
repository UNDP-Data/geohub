<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { ALGORITHM_TAG_KEY } from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import StacCatalogExplorer from '$components/util/stac/StacCatalogExplorer.svelte';
	import { AccessLevel, MapStyles } from '$lib/config/AppConfig';
	import {
		fromLocalStorage,
		generateHashKey,
		getFirstSymbolLayerId,
		storageKeys,
		toLocalStorage
	} from '$lib/helper';
	import type {
		DatasetFeature,
		Layer,
		RasterAlgorithm,
		RasterTileMetadata,
		StacCatalog,
		StacCatalogBreadcrumb,
		StacCollection,
		Tag
	} from '$lib/types';
	import {
		FieldControl,
		HeroHeader,
		ModalTemplate,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import type {
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	let stac = data.stac;

	let isProcessing = false;
	let datasetId = data.datasetId;
	let isRegistered = data.isRegistered;
	let dataset: DatasetFeature = data.dataset;

	let showRegisterDialog = false;
	let breadcrumbSelected: StacCatalogBreadcrumb;
	let accessLevel: AccessLevel = AccessLevel.PUBLIC;

	let algorithms: { [key: string]: RasterAlgorithm };
	let selectedAlgorithmId = '';
	let toolTags: Tag[] = [];

	const generateCatalogDatasetFeature = async () => {
		const providers: Tag[] = stac.providers?.map((p) => {
			return { key: 'provider', value: p };
		});

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
				access_level: accessLevel,
				tags: [
					{ key: 'type', value: 'stac' },
					{ key: 'stacApiType', value: 'catalog' },
					{ key: 'stacType', value: 'catalog' },
					{ key: 'stac', value: stac.id },
					...providers,
					...toolTags
				]
			}
		};
		return feature;
	};

	const generateCollectionDatasetFeature = async () => {
		const res = await fetch(breadcrumbSelected.url);
		if (!res.ok) {
			toast.push(`${res.status}: ${res.statusText}`);
			return;
		}
		const collection: StacCollection = await res.json();

		const providers: Tag[] = collection.providers?.map((p) => {
			return { key: 'provider', value: p.name };
		});

		const bbox = collection.extent.spatial.bbox[0];
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
				name: `${collection.title ?? collection.id}`,
				description: collection.description ?? collection.title ?? collection.id,
				license: collection.license,
				url: breadcrumbSelected.url,
				is_raster: true,
				access_level: accessLevel,
				tags: [
					{ key: 'type', value: 'stac' },
					{ key: 'stacApiType', value: 'catalog' },
					{ key: 'stacType', value: 'collection' },
					{ key: 'stac', value: stac.id },
					{ key: 'collection', value: collection.id },
					...providers,
					...toolTags
				]
			}
		};
		return feature;
	};

	const handleRegister = async (bc: StacCatalogBreadcrumb) => {
		isProcessing = true;
		try {
			const feature =
				bc.type === 'Catalog'
					? await generateCatalogDatasetFeature()
					: await generateCollectionDatasetFeature();

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
			showRegisterDialog = false;
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
		const url = `/map${storageMapStyleId ? `/${storageMapStyleId}` : ''}/edit`;
		goto(url, { invalidateAll: true });
	};

	let breadcrumbs: BreadcrumbPage[] = [
		{ title: 'home', url: '/' },
		{ title: 'management', url: '/management' },
		{ title: 'stac', url: '/management/stac' },
		{ title: stac.name, url: $page.url.href }
	];

	const handleBreadcrumbSelected = async (e) => {
		const bc: StacCatalogBreadcrumb = e.detail;
		if (bc.type === 'Catalog') {
			breadcrumbSelected = bc;
			datasetId = data.datasetId;
			isRegistered = data.isRegistered;
			dataset = data.dataset;
		} else if (bc.type === 'Collection') {
			breadcrumbSelected = bc;
			const dataInfo = await getDatasetByCollection(bc);
			datasetId = dataInfo.datasetId;
			isRegistered = dataInfo.isRegistered;
			dataset = dataInfo.dataset;
		} else {
			breadcrumbSelected = undefined;
		}
		if (dataset) {
			accessLevel = dataset.properties.access_level;
			toolTags = dataset.properties.tags.filter((t) => t.key === ALGORITHM_TAG_KEY);
		} else {
			accessLevel = AccessLevel.PUBLIC;
			toolTags = [];
		}
	};

	const getDatasetByCollection = async (bc: StacCatalogBreadcrumb) => {
		const datasetId = generateHashKey(bc.url);
		const res = await fetch(`/api/datasets/${datasetId}`);
		const isRegistered = res.status !== 404;
		return { datasetId, isRegistered, dataset: res.ok ? await res.json() : undefined };
	};

	const getAlgorithms = async () => {
		const res = await fetch(`${data.titilerUrl}/algorithms`);
		algorithms = await res.json();
	};

	onMount(() => {
		getAlgorithms();
	});
</script>

<HeroHeader title={breadcrumbs[breadcrumbs.length - 1].title} bind:breadcrumbs />

<section class="ml-6 mr-4 my-4">
	{#if stac}
		{#if breadcrumbSelected}
			<button
				class="button is-primary is-uppercase has-text-weight-bold {isProcessing
					? 'is-loading'
					: ''} "
				disabled={isProcessing}
				on:click={() => {
					showRegisterDialog = true;
				}}
			>
				{#if isRegistered}
					Edit
				{:else}
					Register
				{/if}
				{breadcrumbSelected?.type}
			</button>
			{#if isRegistered}
				<button
					class="button is-link is-uppercase has-text-weight-bold {isProcessing
						? 'is-loading'
						: ''} "
					disabled={isProcessing}
					on:click={() => {
						handleDelete();
					}}
				>
					Delete {breadcrumbSelected?.type}
				</button>
			{/if}
		{/if}

		<StacCatalogExplorer
			bind:stacId={stac.id}
			on:dataAdded={dataAddedToMap}
			on:breadcrumbSelected={handleBreadcrumbSelected}
		/>
	{/if}
</section>

<ModalTemplate title={isRegistered ? 'Edit' : 'Register'} bind:show={showRegisterDialog}>
	<div slot="content">
		<FieldControl title="Access level" showHelp={false} fontWeight="bold">
			<div slot="control">
				<AccessLevelSwitcher bind:accessLevel />
			</div>
		</FieldControl>
		{#if breadcrumbSelected?.type === 'Collection'}
			<FieldControl title="Tools" showHelp={false} fontWeight="bold">
				<div slot="control">
					{#if algorithms}
						<div class="is-flex">
							<div class="select is-fullwidth">
								<select bind:value={selectedAlgorithmId}>
									<option value="">Select a tool</option>
									{#each Object.keys(algorithms) as id}
										{#if toolTags.findIndex((t) => t.value === id) === -1}
											<option value={id}>{algorithms[id].title}</option>
										{/if}
									{/each}
								</select>
							</div>
							<button
								type="button"
								class="button is-link ml-2"
								disabled={selectedAlgorithmId === ''}
								on:click={() => {
									toolTags = [
										...toolTags,
										{
											key: ALGORITHM_TAG_KEY,
											value: selectedAlgorithmId
										}
									];
								}}>Add</button
							>
						</div>
						<div class="tags my-2">
							{#each toolTags as tag}
								<div class="tags has-addons m-1">
									<span class="tag is-link">{tag.value}</span>
									<button
										class="tag is-delete"
										on:click={() => {
											toolTags = toolTags.filter((t) => t.value !== tag.value);
										}}
									></button>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</FieldControl>
		{/if}
	</div>
	<div slot="buttons">
		<button
			class="button is-primary is-upppercase has-text-weight-bold {isProcessing
				? 'is-loading'
				: ''}"
			on:click={() => {
				handleRegister(breadcrumbSelected);
			}}
			disabled={isProcessing}
			type="button"
		>
			{isRegistered ? 'Update' : 'Register'}
		</button>
	</div>
</ModalTemplate>

<SvelteToast />
