<script lang="ts">
	import { page } from '$app/stores';
	import AddLayerButton from '$components/pages/map/data/AddLayerButton.svelte';
	import DataCardInfo from '$components/pages/map/data/DataCardInfo.svelte';
	import DataVectorCard from '$components/pages/map/data/DataVectorCard.svelte';
	import StacExplorerButton from '$components/pages/map/data/StacExplorerButton.svelte';
	import MiniMap from '$components/util/MiniMap.svelte';
	import { RasterTileData } from '$lib/RasterTileData';
	import { VectorTileData } from '$lib/VectorTileData';
	import { loadMap } from '$lib/helper';
	import type {
		DatasetFeature,
		Layer,
		RasterTileMetadata,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, layerList, type MapStore } from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl';
	import { getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	export let feature: DatasetFeature;
	export let isExpanded: boolean;
	export let isStarOnly = false;

	let defaultLineWidth = $page.data.config.LineWidth;

	let nodeRef: HTMLElement;
	let defaultColor: string = undefined;
	let defaultColormap: string = undefined;
	let clientWidth: number;
	let layerLoading = false;
	$: width = `${clientWidth * 0.95}px`;

	let metadata: RasterTileMetadata | VectorTileMetadata;

	const is_raster: boolean = feature.properties.is_raster as unknown as boolean;
	const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
		{ key: string; value: string }
	];
	const stacType = tags?.find((tag) => tag.key === 'stac');

	let expanded: { [key: string]: boolean } = {};
	let expandedDatasetAssetId: string;

	let tilestatsLayers: VectorLayerTileStatLayer[] = [];
	let showSTACDialog = false;

	let isGettingMetadata: Promise<void>;
	const getMetadata = async () => {
		if (is_raster) return;
		const vectorTile = new VectorTileData(feature, defaultLineWidth, undefined);
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
					const rasterTile = new RasterTileData(feature, rasterInfo);
					const data = await rasterTile.add($map);
					$layerList = [
						{
							id: data.layer.id,
							name: feature.properties.name,
							info: data.metadata,
							dataset: feature,
							colorMapName: data.colormap,
							classificationMethod: data.classification_method
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

	const addStacLayer = async (e: {
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
		try {
			if (!e.detail) return;
			let dataArray = e.detail.layers;

			const rasterInfo = dataArray[0].metadata;
			for (const data of dataArray) {
				if (!$map.getSource(data.sourceId)) {
					$map.addSource(data.sourceId, data.source);
				}

				if (!$map.getLayer(data.layer.id)) {
					let firstSymbolId = undefined;
					for (const layer of $map.getStyle().layers) {
						if (layer.type === 'symbol') {
							firstSymbolId = layer.id;
							break;
						}
					}
					$map.addLayer(data.layer, firstSymbolId);
				}

				$layerList = [data.geohubLayer, ...$layerList];
			}

			// eslint-disable-next-line @typescript-eslint/ban-ts-comment
			// @ts-ignore
			$map.fitBounds(rasterInfo.bounds);
		} finally {
			layerLoading = false;
			showSTACDialog = false;
		}
		await loadMap($map);
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
						{#if !isExpanded}
							{#if stacType}
								<StacExplorerButton
									bind:feature
									bind:isLoading={layerLoading}
									isIconButton={true}
									on:clicked={addStacLayer}
									bind:showDialog={showSTACDialog}
								/>
							{:else}
								<AddLayerButton
									bind:isLoading={layerLoading}
									title="Add layer"
									isIconButton={true}
									on:clicked={addLayer}
								/>
							{/if}
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
						{#if stacType}
							<StacExplorerButton
								bind:feature
								bind:isLoading={layerLoading}
								isIconButton={false}
								on:clicked={addStacLayer}
								bind:showDialog={showSTACDialog}
							/>
						{:else}
							<AddLayerButton
								bind:isLoading={layerLoading}
								title="Add layer"
								on:clicked={addLayer}
								on:clicked={addStacLayer}
							/>
						{/if}
					{/await}
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
