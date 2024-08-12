<script lang="ts" context="module">
	export interface ToolsBreadcrumb extends BreadcrumbPage {
		type?: 'Tools' | 'Tool' | 'Dataset';
		algorithm?: RasterAlgorithm;
		algorithmId?: string;
		dataset?: DatasetFeature;
		stacCollection?: StacCollection;
	}
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { algorithmCategory } from '$components/maplibre/raster/RasterAlgorithmExplorer.svelte';
	import PublishedDatasetRow from '$components/pages/data/datasets/PublishedDatasetRow.svelte';
	import StacCatalogTool from '$components/util/stac/StacCatalogTool.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { addDataToLocalStorage, getFirstSymbolLayerId } from '$lib/helper';
	import type {
		DatasetFeature,
		DatasetFeatureCollection,
		Layer,
		RasterAlgorithm,
		RasterTileMetadata,
		StacCollection
	} from '$lib/types';
	import {
		HeroHeader,
		Notification,
		getRandomColormap,
		type BreadcrumbPage
	} from '@undp-data/svelte-undp-components';
	import { Card, Loader, Pagination } from '@undp-data/svelte-undp-design';
	import type {
		HillshadeLayerSpecification,
		RasterDEMSourceSpecification,
		RasterLayerSpecification,
		RasterSourceSpecification,
		StyleSpecification
	} from 'maplibre-gl';
	import { v4 as uuidv4 } from 'uuid';
	import type { PageData } from './$types';

	export let data: PageData;

	let isLoading = false;
	let datasets: DatasetFeatureCollection;
	let algorithms = data.algorithms;

	let breadcrumbs: ToolsBreadcrumb[] = [
		{ title: 'home', url: '/' },
		{ title: 'Tools', type: 'Tools' }
	];

	let terrainAlgoIds = ['contours', 'hillshade', 'terrainrgb', 'terrarium'];

	const handleBreadcrumbClicked = (e) => {
		const page: ToolsBreadcrumb = e.detail;
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

	const handleDatasetSelected = async (e) => {
		const dataset: DatasetFeature = e.detail;
		const dataType = dataset.properties.tags?.find((t) => t.key === 'type')?.value;
		const algoBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
		if (dataType === 'stac') {
			// stac data
			const res = await fetch(dataset.properties.url);
			const collection = await res.json();

			breadcrumbs = [
				...breadcrumbs,
				{
					title: dataset.properties.name,
					type: 'Dataset',
					dataset: dataset,
					stacCollection: collection,
					algorithmId: algoBreadcrumb.algorithmId,
					algorithm: algoBreadcrumb.algorithm
				}
			];
		} else {
			// azure data
			await azureDataAddedToMap(algoBreadcrumb.algorithmId, algoBreadcrumb.algorithm, dataset);
		}
	};

	const handlePaginationClicked = async (e: { detail: { type: 'previous' | 'next' } }) => {
		const type = e.detail.type;

		const link = datasets.links.find((l) => l.rel === type);
		if (link) {
			const href = new URL(link.href);
			const res = await fetch(href);
			datasets = await res.json();
		}
	};

	const getAlgoTileUrl = (id: string, feature: DatasetFeature) => {
		const urlString = feature.properties.links.find((l) => l.rel === 'tiles').href;
		const tileUrl = new URL(urlString);
		const algoUrl = new URL(`${tileUrl.origin}${tileUrl.pathname}`);
		algoUrl.searchParams.set('url', tileUrl.searchParams.get('url'));
		algoUrl.searchParams.set('algorithm', id);

		const algo = algorithms[id];
		// exclude hillshade to use colormap
		if (!['hillshade'].includes(id)) {
			if (algo.outputs.min?.length > 0 && algo.outputs.max?.length > 0) {
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

		let encoding: 'terrarium' | 'mapbox' | 'custom';
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
					bounds: metadata.bounds as [number, number, number, number],
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
					bounds: metadata.bounds as [number, number, number, number]
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
			$page.url,
			(layers: Layer[], style: StyleSpecification, styleId: string) => {
				if (algorithm.outputs.unit) {
					dataset.properties.tags.push({
						key: 'unit',
						value: algorithm.outputs.unit
					});
				}

				metadata.active_band_no = Object.keys(metadata.stats)[0];

				// add layer to local storage
				layers = [
					{
						id: layerId,
						name: dataset.properties.name,
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

	const stacDataAddedToMap = async (e: {
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
</script>

<HeroHeader
	title="Tools and add-ons"
	bind:breadcrumbs
	on:breadcrumbClicked={handleBreadcrumbClicked}
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
							{#if algo.title === 'Flood detection '}
								<!--TODO: Remove this once flood detection algorithm is complete-->
								<span></span>
							{:else}
								<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
									<Card
										linkName="Explore datasets"
										tag="Tool"
										title={algo.title}
										description={algo.description}
										url=""
										accent="yellow"
										on:selected={() => {
											handleToolSelected({
												title: algo.title ?? name,
												type: 'Tool',
												algorithmId: name,
												algorithm: algo
											});
										}}
									/>
								</div>
							{/if}
						{/each}
					</div>

					<h3 class="title is-3 mt-6">Simulation add-ons</h3>

					<div class="columns is-multiline is-mobile">
						{#each data.datasets.features as dataset}
							{@const datasetUrl = dataset.properties.links.find((l) => l.rel === 'dataset')?.href}
							{@const sdgs = dataset.properties.tags
								.filter((t) => t.key === 'sdg_goal')
								.map((t) => Number(t.value))
								.sort((a, b) => a - b)
								.map((v) => `SDG${v}`)}
							{#if datasetUrl}
								<div class="column is-one-third-tablet is-one-quarter-desktop is-full-mobile">
									<Card
										linkName="Explore Dataset"
										tag={sdgs?.length > 0 ? sdgs.join(', ') : 'Simulation'}
										title={dataset.properties.name}
										description={dataset.properties.description}
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
									title={algo.title}
									description={algo.description}
									url=""
									accent="yellow"
									on:selected={() => {
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
					<p class="is-size-6 has-text-weight-bold">{page.algorithm.title ?? page.algorithmId}</p>

					{#if page.algorithm.description}
						<p class="is-size-6">{page.algorithm.description}</p>
					{/if}
				</div>

				{#if isLoading}
					<div class="is-flex is-justify-content-center my-4">
						<Loader />
					</div>
				{:else if datasets?.pages?.totalCount > 0}
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
										bind:feature
										dispatchEvent={true}
										on:selected={handleDatasetSelected}
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
							on:clicked={handlePaginationClicked}
						/>
					</div>
				{:else}
					<Notification type="info" showCloseButton={false}>No datasets found</Notification>
				{/if}
			{:else if page.type === 'Dataset'}
				<div class="pb-4">
					<p class="is-size-6 has-text-weight-bold">{page.algorithm.title ?? page.algorithmId}</p>

					{#if page.algorithm.description}
						<p class="is-size-6">{page.algorithm.description}</p>
					{/if}
				</div>
				<StacCatalogTool
					bind:collection={page.stacCollection}
					bind:collectionUrl={page.dataset.properties.url}
					bind:dataset={page.dataset}
					selectedTool={{ algorithm: page.algorithm, algorithmId: page.algorithmId }}
					on:dataAdded={stacDataAddedToMap}
				/>
			{/if}
		</div>
	{/each}
</div>

<style lang="scss">
	.tools {
		margin-bottom: 96px;
	}
</style>
