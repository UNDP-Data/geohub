<script lang="ts" module>
	import type { StacCollection, StacDataLayer } from '$lib/types';

	export interface ToolsBreadcrumb extends BreadcrumbPage {
		type?: 'Tools' | 'Tool' | 'Dataset';
		algorithm?: RasterAlgorithm;
		algorithmId?: string;
		dataset?: DatasetFeature;
		stacCollection?: StacCollection;
	}
</script>

<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import PublishedDatasetRow from '$components/pages/data/datasets/PublishedDatasetRow.svelte';
	import { algorithmCategory } from '$components/pages/map/data/RasterAlgorithmExplorer.svelte';
	import StacApiExplorer from '$components/util/stac/StacApiExplorer.svelte';
	import StacCatalogTool from '$components/util/stac/StacCatalogTool.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { addDataToLocalStorage, getFirstSymbolLayerId } from '$lib/helper';
	import type { DatasetFeature, DatasetFeatureCollection, Layer } from '$lib/types';
	import {
		HeroHeader,
		Notification,
		getRandomColormap,
		type BreadcrumbPage,
		type RasterAlgorithm
	} from '@undp-data/svelte-undp-components';
	import { Card, Loader, Pagination } from '@undp-data/svelte-undp-design';
	import type {
		HillshadeLayerSpecification,
		RasterDEMSourceSpecification,
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import { onMount } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';
	import type { PageData } from './$types';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();

	let isLoading = $state(false);
	let datasets: DatasetFeatureCollection | undefined = $state();
	let algorithms = data.algorithms;
	let breadcrumbs: ToolsBreadcrumb[] = $state([
		{ title: 'home', url: '/' },
		{ title: 'Tools', type: 'Tools' }
	]);

	let terrainAlgoIds = Object.keys(algorithmCategory)
		.filter((k) => algorithmCategory[k] === 'terrain')
		.map((k) => k.toLowerCase());

	const handleBreadcrumbClicked = (page: BreadcrumbPage) => {
		if (breadcrumbs?.length > 0) {
			const pageIndex = breadcrumbs.findIndex((p) => p.title === page.title);
			breadcrumbs = [...breadcrumbs.slice(0, pageIndex + 1)];
		}
	};

	const handleToolSelected = async (page: ToolsBreadcrumb) => {
		breadcrumbs = [...breadcrumbs, page];
		isLoading = true;
		try {
			const apiUrl = `/api/datasets?algorithm=${page.algorithmId}`;
			const res = await fetch(apiUrl);
			datasets = await res.json();
		} finally {
			isLoading = false;
		}
	};

	const handleDatasetSelected = async (dataset: DatasetFeature) => {
		const dataType = dataset.properties.tags?.find((t) => t.key === 'type')?.value;
		const algoBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
		if (dataType === 'stac') {
			// stac data
			const res = await fetch(dataset.properties.url);
			const collection = await res.json();

			breadcrumbs = [
				...breadcrumbs,
				{
					title: dataset.properties.name as string,
					type: 'Dataset',
					dataset: dataset,
					stacCollection: collection,
					algorithmId: algoBreadcrumb.algorithmId,
					algorithm: algoBreadcrumb.algorithm
				}
			];
		} else {
			// azure data
			await azureDataAddedToMap(
				algoBreadcrumb.algorithmId as string,
				algoBreadcrumb.algorithm as RasterAlgorithm,
				dataset
			);
		}
	};

	const handlePaginationClicked = async (type: 'previous' | 'next') => {
		const link = datasets?.links.find((l) => l.rel === type);
		if (link) {
			const href = new URL(link.href);
			const res = await fetch(href);
			datasets = await res.json();
		}
	};

	const getAlgoTileUrl = (id: string, feature: DatasetFeature) => {
		const urlString = feature.properties.links?.find((l) => l.rel === 'tiles')?.href;
		if (!urlString) return '';
		const tileUrl = new URL(urlString);
		const algoUrl = new URL(`${tileUrl.origin}${tileUrl.pathname}`);
		algoUrl.searchParams.set('url', tileUrl.searchParams.get('url') as string);
		algoUrl.searchParams.set('algorithm', id);

		const algo = algorithms[id];
		// exclude hillshade to use colormap
		if (!['hillshade'].includes(id)) {
			if (
				algo.outputs.min &&
				algo.outputs.min?.length > 0 &&
				algo.outputs.max &&
				algo.outputs.max?.length > 0
			) {
				const rescale = [algo.outputs.min, algo.outputs.max];
				algoUrl.searchParams.set('rescale', rescale.join(','));
			}

			if (algo.outputs.nbands === 1) {
				algoUrl.searchParams.set('colormap_name', getRandomColormap('sequential'));
			}

			if (algo.inputs.nbands === 1) {
				algoUrl.searchParams.set('bidx', '1');
			}
		}

		return decodeURIComponent(algoUrl.href);
	};

	const azureDataAddedToMap = async (
		algorithmId: string,
		algorithm: RasterAlgorithm,
		dataset: DatasetFeature
	) => {
		const rasterTile = new RasterTileData(dataset);
		const metadata = await rasterTile.getMetadata(algorithmId);

		const attribution = dataset.properties.tags
			?.filter((t) => t.key === 'provider')
			.map((t) => t.value)
			.join(', ');

		const algoUrl = getAlgoTileUrl(algorithmId, dataset);
		const layerId = uuidv4();
		const sourceId = layerId;

		let layer: RasterLayerSpecification | HillshadeLayerSpecification;
		let source: RasterDEMSourceSpecification | RasterSourceSpecification;
		let colormap_name = '';

		let encoding: 'terrarium' | 'mapbox' | 'custom' | undefined = undefined;
		switch (algorithmId) {
			case 'terrarium':
			case 'terrainrgb':
				if (algorithmId === 'terrarium') {
					encoding = 'terrarium';
				} else if (algorithmId === 'terrainrgb') {
					encoding = 'mapbox';
				}

				source = {
					type: 'raster-dem',
					tiles: [algoUrl],
					encoding,
					bounds: metadata?.bounds as [number, number, number, number],
					attribution: attribution
				} as RasterDEMSourceSpecification;

				layer = {
					id: layerId,
					type: 'hillshade',
					source: sourceId,
					paint: {
						'hillshade-accent-color': '#000000',
						'hillshade-exaggeration': 0.5,
						'hillshade-highlight-color': '#FFFFFF',
						'hillshade-illumination-anchor': 'viewport',
						'hillshade-illumination-direction': 335,
						'hillshade-shadow-color': '#000000'
					},
					layout: {
						visibility: 'visible'
					}
				} as HillshadeLayerSpecification;
				break;
			default:
				source = {
					type: 'raster',
					tiles: [algoUrl],
					attribution: attribution,
					bounds: metadata?.bounds as [number, number, number, number]
				} as RasterSourceSpecification;

				colormap_name = new URL(algoUrl).searchParams.get('colormap_name') ?? '';

				layer = {
					id: layerId,
					type: 'raster',
					source: sourceId,
					paint: {
						'raster-resampling': 'nearest',
						'raster-opacity': 1
					},
					layout: {
						visibility: 'visible'
					}
				} as RasterLayerSpecification;
				break;
		}

		const mapUrl = await addDataToLocalStorage(
			page.url,
			(layers: Layer[], style: StyleSpecification, styleId: string) => {
				if (algorithm.outputs.unit) {
					dataset.properties.tags?.push({
						key: 'unit',
						value: algorithm.outputs.unit
					});
				}
				if (metadata && metadata.stats) {
					metadata.active_band_no = Object.keys(metadata.stats)[0];
				}

				// add layer to local storage
				layers = [
					{
						id: layerId,
						name: dataset.properties.name as string,
						info: metadata,
						dataset: dataset,
						colorMapName: colormap_name
					},
					...layers
				];

				let idx = style.layers.length - 1;

				const firstSymbolLayerId = getFirstSymbolLayerId(style.layers);
				if (firstSymbolLayerId) {
					idx = style.layers.findIndex((l) => l.id === firstSymbolLayerId);
				}
				style.layers.splice(idx, 0, layer);

				if (!style.sources[sourceId]) {
					style.sources[sourceId] = source;
				}

				return { layers, style, styleId };
			}
		);

		// move to /map page
		goto(mapUrl.url, { invalidateAll: true });
	};

	const stacDataAddedToMap = async (dataArray: StacDataLayer[]) => {
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

	onMount(() => {
		const algoId = page.url.searchParams.get('algorithm');
		if (algoId && data.algorithms[algoId]) {
			const defaultAlgo = data.algorithms[algoId];
			handleToolSelected({
				title: defaultAlgo.title ?? algoId,
				type: 'Tool',
				algorithmId: algoId,
				algorithm: defaultAlgo
			});
			const pageUrl = page.url;
			pageUrl.searchParams.delete('algorithm');
			replaceState(pageUrl, '');
		}
	});
</script>

<HeroHeader
	title="Tools and add-ons"
	bind:breadcrumbs
	onBreadcrumbClick={handleBreadcrumbClicked}
/>

<div class="m-6 tools">
	{#each breadcrumbs as page, index}
		{@const isLastPage = index === breadcrumbs.length - 1}
		<div hidden={!isLastPage}>
			{#if page.type === 'Tools'}
				{#if Object.keys(algorithms).length === 0}
					<Notification showCloseButton={false}>No tools registered</Notification>
				{:else}
					{@const geohubAlgos = Object.keys(algorithms).filter(
						(k) => !terrainAlgoIds.includes(k.toLowerCase())
					)}
					{@const terrainAlgos = Object.keys(algorithms).filter((k) =>
						terrainAlgoIds.includes(k.toLowerCase())
					)}

					<h3 class="title is-3 mt-6">Tools</h3>

					<div class="columns is-multiline is-mobile">
						<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
							<Card
								linkName="Launch"
								tag="Tool"
								title="New Map"
								description="Launch a standard map editor tool to create new map."
								url="/maps/edit"
								accent="yellow"
							/>
						</div>

						{#each geohubAlgos as name}
							{@const algo = algorithms[name]}
							<!--{#if algo.title === 'Flood detection '}-->
							<!--	&lt;!&ndash;TODO: Remove this once flood detection algorithm is complete&ndash;&gt;-->
							<!--	<span></span>-->
							<!--{:else}-->
							<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
								<Card
									linkName="Explore datasets"
									tag="Tool"
									title={algo.title as string}
									description={algo.description as string}
									url=""
									accent="yellow"
									onselect={() => {
										handleToolSelected({
											title: algo.title ?? name,
											type: 'Tool',
											algorithmId: name,
											algorithm: algo
										});
									}}
								/>
							</div>
							<!--{/if}-->
						{/each}
					</div>

					<h3 class="title is-3 mt-6">Simulation add-ons</h3>

					<div class="columns is-multiline is-mobile">
						{#each data.datasets.features as dataset}
							{@const datasetUrl = dataset.properties.links?.find((l) => l.rel === 'dataset')?.href}
							{@const sdgs = dataset.properties.tags
								?.filter((t) => t.key === 'sdg_goal')
								.map((t) => Number(t.value))
								.sort((a, b) => a - b)
								.map((v) => `SDG${v}`)}
							{#if datasetUrl}
								<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
									<Card
										linkName="Explore Dataset"
										tag={sdgs && sdgs.length > 0 ? sdgs.join(', ') : 'Simulation'}
										title={dataset.properties.name as string}
										description={dataset.properties.description as string}
										url={datasetUrl}
										accent="yellow"
									/>
								</div>
							{/if}
						{/each}
					</div>

					<h3 class="title is-3 mt-6">Terrain add-ons</h3>

					<div class="columns is-multiline is-mobile">
						{#each terrainAlgos as name}
							{@const algo = algorithms[name]}
							<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
								<Card
									linkName="Explore datasets"
									tag={algorithmCategory[name.toLowerCase()] ?? 'geohub'}
									title={algo.title as string}
									description={algo.description as string}
									url=""
									accent="yellow"
									onselect={() => {
										handleToolSelected({
											title: algo.title ?? name,
											type: 'Tool',
											algorithmId: name,
											algorithm: algo
										});
									}}
								/>
							</div>
						{/each}
					</div>
				{/if}
			{:else if page.type === 'Tool'}
				<div class="pb-4">
					<p class="is-size-6 has-text-weight-bold">{page.algorithm?.title ?? page.algorithmId}</p>

					{#if page.algorithm?.description}
						<p class="is-size-6">{page.algorithm.description}</p>
					{/if}
				</div>

				{#if isLoading}
					<div class="is-flex is-justify-content-center my-4">
						<Loader />
					</div>
				{:else if datasets?.pages && datasets.pages.totalCount > 0}
					<p class="is-size-6 has-text-weight-bold pb-4">Select a dataset to apply the tool</p>

					<div class="table-container">
						<table class="table is-hoverable is-fullwidth">
							<thead>
								<tr>
									<th>Dataset name</th>
									<th>Description</th>
									<th>SDG</th>
									<th>License</th>
									<th>Updated at</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								{#each datasets.features as feature}
									<PublishedDatasetRow
										{feature}
										dispatchEvent={true}
										onselect={handleDatasetSelected}
									/>
								{/each}
							</tbody>
						</table>
					</div>
					<div class="is-flex is-justify-content-center pt-5">
						<Pagination
							totalPages={datasets.pages.totalPages}
							currentPage={datasets.pages.currentPage}
							hidden={datasets.pages.totalPages <= 1}
							onclick={handlePaginationClicked}
						/>
					</div>
				{:else}
					<Notification type="info" showCloseButton={false}>No datasets found</Notification>
				{/if}
			{:else if page.type === 'Dataset'}
				<div class="pb-4">
					<p class="is-size-6 has-text-weight-bold">{page.algorithm?.title ?? page.algorithmId}</p>

					{#if page.algorithm?.description}
						<p class="is-size-6">{page.algorithm.description}</p>
					{/if}
				</div>
				{#if page.dataset?.properties.tags?.find((t) => t.key === 'stacApiType')?.value === 'catalog'}
					<StacCatalogTool
						bind:collection={page.stacCollection as StacCollection}
						bind:collectionUrl={page.dataset.properties.url}
						bind:dataset={page.dataset}
						selectedTool={{
							algorithm: page.algorithm as RasterAlgorithm,
							algorithmId: page.algorithmId as string
						}}
						onDataAdded={stacDataAddedToMap}
					/>
				{:else}
					<StacApiExplorer
						bind:selectedTool={page.algorithm as RasterAlgorithm}
						collection={page.dataset?.properties.tags?.find((t) => t.key === 'collection')
							?.value as string}
						stacId={page.dataset?.properties.tags?.find((t) => t.key === 'stac')?.value as string}
						onDataAdded={stacDataAddedToMap}
						bind:dataset={page.dataset as DatasetFeature}
					/>
				{/if}
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.tools {
		margin-bottom: 96px;
	}
</style>
