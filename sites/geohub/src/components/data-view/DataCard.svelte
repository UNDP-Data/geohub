<script lang="ts">
	import { page } from '$app/stores';
	import AddLayerButton from '$components/data-view/AddLayerButton.svelte';
	import DataCardInfo from '$components/data-view/DataCardInfo.svelte';
	import DataStacAssetCard from '$components/data-view/DataStacAssetCard.svelte';
	import DataVectorCard from '$components/data-view/DataVectorCard.svelte';
	import MiniMap from '$components/data-view/MiniMap.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { loadMap } from '$lib/helper';
	import type {
		AssetOptions,
		DatasetFeature,
		RasterTileMetadata,
		StacItemFeatureCollection,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import { layerList, map } from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';

	export let feature: DatasetFeature;
	export let isExpanded: boolean;
	export let isStarOnly = false;

	let defaultLineWidth = $page.data.config.LineWidth;
	let layerOpacity = $page.data.config.LayerOpacity / 100;

	let nodeRef: HTMLElement;
	let defaultColor: string = undefined;
	let defaultColormap: string = undefined;
	let clientWidth: number;
	let layerLoading = false;
	$: width = `${clientWidth * 0.95}px`;

	let assetList: AssetOptions[] = [];

	let metadata: RasterTileMetadata | VectorTileMetadata;

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const stacType = tags?.find((tag) => tag.key === 'stac');

	let expanded: { [key: string]: boolean } = {};
	let expandedDatasetAssetId: string;

	let tilestatsLayers: VectorLayerTileStatLayer[] = [];

	let isGettingMetadata: Promise<void>;
	const getMetadata = async () => {
		if (is_raster) return;
		const vectorTile = new VectorTileData(feature, defaultLineWidth);
		const res = await vectorTile.getMetadata();
		metadata = res.metadata;
		tilestatsLayers = res.metadata.json?.tilestats?.layers;
	};

	$: {
		let expandedDatasets = Object.keys(expanded).filter(
			(key) => expanded[key] === true && key !== expandedDatasetAssetId
		);
		if (expandedDatasets.length > 0) {
			expandedDatasetAssetId = expandedDatasets[0];
			Object.keys(expanded)
				.filter((key) => key !== expandedDatasetAssetId)
				.forEach((key) => {
					expanded[key] = false;
				});
			expanded[expandedDatasets[0]] = true;
		}
	}

	const addLayer = async () => {
		try {
			layerLoading = true;

			if (is_raster) {
				if (stacType) {
					// STAC
					return;
				} else {
					// COG
					const rasterInfo = metadata as RasterTileMetadata;
					const rasterTile = new RasterTileData(feature, rasterInfo, layerOpacity);
					const data = await rasterTile.add($map, defaultColormap);
					$layerList = [
						{
							id: data.layer.id,
							name: feature.properties.name,
							info: data.metadata,
							dataset: feature,
							colorMapName: data.colormap
						},
						...$layerList
					];
				}

				await loadMap($map);
			}
		} finally {
			layerLoading = false;
		}
	};

	const getStacAssetList = async () => {
		if (!isExpanded) return;
		if (!stacType) return;

		const LIMIT = 50;
		const url: string = feature.properties.url;
		const res = await fetch(`${url}?limit=1`);
		const fc: StacItemFeatureCollection = await res.json();
		const f = fc.features[0];
		const rootUrl = f.links.find((link) => link.rel === 'root').href;
		const assets = f.assets;
		const itemProperties = f.properties;
		const collectionId = f.collection;
		assetList = [];
		Object.keys(assets).forEach((assetName) => {
			const asset = assets[assetName];
			if (asset.type !== 'image/tiff; application=geotiff; profile=cloud-optimized') return;
			// generate URL for search API except bbox parameter
			// bbox needs to be specified from frontend based on the current viewing.
			// this search URL does not work, it needs to be converted to POST version from query params specified by frontend.
			let searchUrl = `${rootUrl}search?collections=${collectionId}&sortby=${'datetime'}&limit=${LIMIT}`;
			if (itemProperties['eo:cloud_cover']) {
				searchUrl = `${searchUrl}&filter=${JSON.stringify({
					op: '<=',
					args: [{ property: 'eo:cloud_cover' }, 5]
				})}`;
			}

			assetList = [
				...assetList,
				{
					url: searchUrl,
					assetName: assetName,
					title: `${asset.title ?? assetName}`,
					asset: asset,
					collectionId: collectionId
				}
			];
		});
	};

	const handleStarDeleted = () => {
		if (isStarOnly === true) {
			nodeRef.parentNode.removeChild(nodeRef);
		}
	};

	if (!is_raster) {
		isGettingMetadata = getMetadata();
	}

	$: if (isExpanded === true) {
		if (is_raster) {
			isGettingMetadata = getMetadata();
		}
		getStacAssetList();
	}
</script>

<div bind:this={nodeRef}>
	{#if tilestatsLayers?.length === 1}
		<DataVectorCard
			bind:layer={tilestatsLayers[0]}
			bind:feature
			bind:isExpanded
			bind:defaultColor
			bind:metadata
			on:starDeleted={handleStarDeleted}
			isShowInfo={true}
		/>
	{:else}
		<Accordion headerTitle={feature.properties.name} bind:isExpanded>
			<div slot="button">
				{#await isGettingMetadata then}
					{#if tilestatsLayers?.length < 2}
						{#if !stacType && !isExpanded}
							<AddLayerButton
								bind:isLoading={layerLoading}
								title="Add layer"
								isIconButton={true}
								on:clicked={addLayer}
							/>
						{/if}
					{/if}
				{/await}
			</div>
			<div slot="content" class="card-container px-1" bind:clientWidth>
				{#if !is_raster && tilestatsLayers?.length > 1}
					<DataCardInfo bind:feature bind:metadata on:starDeleted={handleStarDeleted} />

					{#each tilestatsLayers as layer}
						<DataVectorCard
							bind:layer
							bind:feature
							bind:isExpanded={expanded[`${feature.properties.id}-${layer.layer}`]}
							bind:defaultColor
							bind:metadata
							isShowInfo={false}
						/>
					{/each}
				{:else}
					<DataCardInfo bind:feature bind:metadata on:starDeleted={handleStarDeleted}>
						<div class="map">
							<MiniMap
								bind:feature
								bind:width
								height={'150px'}
								bind:isLoadMap={isExpanded}
								bind:metadata
								bind:defaultColor
								bind:defaultColormap
							/>
						</div>
					</DataCardInfo>

					{#await isGettingMetadata then}
						{#if !stacType}
							<AddLayerButton
								bind:isLoading={layerLoading}
								title="Add layer"
								on:clicked={addLayer}
							/>
						{/if}
					{/await}

					{#if stacType && stacType.key === 'stac' && assetList}
						<!--show asset list-->
						{#each assetList as asset}
							<DataStacAssetCard
								bind:asset
								bind:feature
								bind:isExpanded={expanded[`${feature.properties.id}-${asset.assetName}`]}
							/>
						{/each}
					{/if}
				{/if}
			</div>
		</Accordion>
	{/if}
</div>

<style lang="scss">
	.card-container {
		display: flex;
		flex-direction: column;
		margin-bottom: 0.5rem;

		.map {
			padding-bottom: 0.5rem;
		}
	}
</style>
