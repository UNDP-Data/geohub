<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { ALGORITHM_TAG_KEY } from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
	import AccessLevelSwitcher from '$components/util/AccessLevelSwitcher.svelte';
	import StacCatalogExplorer from '$components/util/stac/StacCatalogExplorer.svelte';
	import { AccessLevel } from '$lib/config/AppConfig';
	import { addDataToLocalStorage, generateHashKey, getFirstSymbolLayerId } from '$lib/helper';
	import type {
		DatasetFeature,
		Layer,
		StacCatalog,
		StacCatalogBreadcrumb,
		StacCollection,
		StacDataLayer,
		Tag
	} from '$lib/types';
	import {
		FieldControl,
		HeroHeader,
		ModalTemplate,
		type BreadcrumbPage,
		type RasterAlgorithm
	} from '@undp-data/svelte-undp-components';
	import { SvelteToast, toast } from '@zerodevx/svelte-toast';
	import type { StyleSpecification } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	let stac = $state(data.stac);

	let isProcessing = $state(false);
	let datasetId = data.datasetId;
	let isRegistered = $state(data.isRegistered);
	let dataset: DatasetFeature = data.dataset;

	let showRegisterDialog = $state(false);
	let breadcrumbSelected: StacCatalogBreadcrumb | undefined = $state();
	let accessLevel: AccessLevel = $state(AccessLevel.PUBLIC);

	let algorithms: { [key: string]: RasterAlgorithm } | undefined = $state();
	let selectedAlgorithmId = $state('');
	let toolTags: Tag[] = $state([]);

	const generateCatalogDatasetFeature = async () => {
		const providers: Tag[] = stac.providers?.map((p) => {
			return { key: 'provider', value: p };
		}) as Tag[];

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
		const collectionUrl = breadcrumbSelected?.url ?? breadcrumbSelected?.dataUrl;
		if (!collectionUrl) return;
		const res = await fetch(collectionUrl);
		if (!res.ok) {
			toast.push(`${res.status}: ${res.statusText}`);
			return;
		}
		const collection: StacCollection = await res.json();

		const providers: Tag[] = collection.providers?.map((p) => {
			return { key: 'provider', value: p.name };
		}) as Tag[];

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
				url: collectionUrl,
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

	const handleRegister = async (bc?: StacCatalogBreadcrumb) => {
		if (!bc) return;
		isProcessing = true;
		try {
			const feature =
				bc.type === 'Catalog'
					? await generateCatalogDatasetFeature()
					: await generateCollectionDatasetFeature();

			const formData = new FormData();
			formData.append('feature', JSON.stringify(feature));
			const res = await fetch(`${page.url.pathname}?/register`, {
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

	const dataAddedToMap = async (dataArray: StacDataLayer[]) => {
		const mapUrl = await addDataToLocalStorage(
			page.url,
			(layers: Layer[], style: StyleSpecification, styleId: string) => {
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

	let breadcrumbs: BreadcrumbPage[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'management', url: '/management' },
		{ title: 'stac', url: '/management/stac' },
		{ title: stac.name, url: page.url.href }
	]);

	const handleBreadcrumbSelected = async (bc: StacCatalogBreadcrumb) => {
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
			toolTags = dataset.properties.tags?.filter((t) => t.key === ALGORITHM_TAG_KEY) as Tag[];
		} else {
			accessLevel = AccessLevel.PUBLIC;
			toolTags = [];
		}
	};

	const getDatasetByCollection = async (bc: StacCatalogBreadcrumb) => {
		const datasetId = generateHashKey(bc.dataUrl);
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

<section class="m-6">
	{#if stac}
		{#if breadcrumbSelected}
			<button
				class="button is-primary is-uppercase has-text-weight-bold {isProcessing
					? 'is-loading'
					: ''} "
				disabled={isProcessing}
				onclick={() => {
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
					onclick={() => {
						handleDelete();
					}}
				>
					Delete {breadcrumbSelected?.type}
				</button>
			{/if}
		{/if}

		<StacCatalogExplorer
			stacId={stac.id}
			onDataAdded={dataAddedToMap}
			onBreadcrumbSelected={handleBreadcrumbSelected}
		/>
	{/if}
</section>

<ModalTemplate title={isRegistered ? 'Edit' : 'Register'} bind:show={showRegisterDialog}>
	{#snippet content()}
		<div>
			<FieldControl title="Access level" showHelp={false} fontWeight="bold">
				{#snippet control()}
					<div>
						<AccessLevelSwitcher bind:accessLevel />
					</div>
				{/snippet}
			</FieldControl>
			{#if breadcrumbSelected?.type === 'Collection'}
				<FieldControl title="Tools" showHelp={false} fontWeight="bold">
					{#snippet control()}
						<div>
							{#if algorithms}
								<div class="is-flex">
									<div class="select is-fullwidth">
										<select bind:value={selectedAlgorithmId}>
											<option value="">Select a tool</option>
											{#each Object.keys(algorithms) as id (id)}
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
										onclick={() => {
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
									{#each toolTags as tag (tag.value)}
										<div class="tags has-addons m-1">
											<span class="tag is-link">{tag.value}</span>
											<button
												class="tag is-delete"
												onclick={() => {
													toolTags = toolTags.filter((t) => t.value !== tag.value);
												}}
												aria-label="delete"
											></button>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/snippet}
				</FieldControl>
			{/if}
		</div>
	{/snippet}
	{#snippet buttons()}
		<div>
			<button
				class="button is-primary is-upppercase has-text-weight-bold {isProcessing
					? 'is-loading'
					: ''}"
				onclick={() => {
					handleRegister(breadcrumbSelected);
				}}
				disabled={isProcessing}
				type="button"
			>
				{isRegistered ? 'Update' : 'Register'}
			</button>
		</div>
	{/snippet}
</ModalTemplate>

<SvelteToast />
