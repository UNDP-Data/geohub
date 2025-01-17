<script lang="ts">
	import { page } from '$app/state';
	import AddLayerButton from '$components/pages/map/data/AddLayerButton.svelte';
	import DataCardInfo from '$components/pages/map/data/DataCardInfo.svelte';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import MiniMap from '$components/util/MiniMap.svelte';
	import { VectorTileData } from '$lib/VectorTileData';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import type { DatasetFeature, LayerCreationInfo } from '$lib/types';
	import { LAYERLISTSTORE_CONTEXT_KEY, type LayerListStore } from '$stores';
	import {
		Accordion,
		MAPSTORE_CONTEXT_KEY,
		type MapStore,
		type RasterTileMetadata,
		type VectorLayerTileStatLayer,
		type VectorTileMetadata,
		loadMap
	} from '@undp-data/svelte-undp-components';
	import { toast } from '@zerodevx/svelte-toast';
	import { LngLatBounds } from 'maplibre-gl';
	import { getContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	interface Props {
		layer: VectorLayerTileStatLayer;
		feature: DatasetFeature;
		isExpanded?: boolean;
		metadata: RasterTileMetadata | VectorTileMetadata;
		isShowInfo?: boolean;
		onStarDeleted?: () => void;
	}

	let {
		layer = $bindable(),
		feature = $bindable(),
		isExpanded = $bindable(),
		metadata = $bindable(),
		isShowInfo = $bindable(false),
		onStarDeleted = () => {}
	}: Props = $props();

	let config: UserConfig = page.data.config;

	let vectorInfo = metadata as VectorTileMetadata;
	let clientWidth: number = $state(0);
	let width = $derived(`${clientWidth * 0.95}px`);
	let accordionTitle = $derived(
		vectorInfo.json?.vector_layers && vectorInfo.json.vector_layers.length > 1
			? layer.layer
			: (feature.properties.name as string)
	);

	let layerLoading = $state(false);

	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle' = $state();

	let layerCreationInfo: LayerCreationInfo | undefined = $state();

	const addLayer = async () => {
		try {
			layerLoading = true;

			if (!layerCreationInfo) {
				const vectorTile = new VectorTileData(feature, config.FillExtrusionDefaultPitch);
				layerCreationInfo = await vectorTile.add($map, layerType, layer.layer);
			} else {
				const sourceId = layerCreationInfo.sourceId;
				if (!$map.getSource(sourceId)) {
					$map.addSource(sourceId, layerCreationInfo.source);
				}

				const layerId = uuidv4();
				layerCreationInfo.layer.id = layerId;
				$map.addLayer(layerCreationInfo.layer);

				const bounds = (layerCreationInfo.metadata.bounds as string)
					.split(',')
					.map((val) => Number(val));
				$map.fitBounds(new LngLatBounds([bounds[0], bounds[1]], [bounds[2], bounds[3]]));

				if (layerCreationInfo.layer.type === 'fill-extrusion') {
					$map.setPitch(config.FillExtrusionDefaultPitch);
				}
			}

			let name = `${feature.properties.name}`;
			if (!isShowInfo) {
				name = `${layer.layer} - ${name}`;
			}
			$layerListStore = [
				{
					id: layerCreationInfo.layer.id,
					name: name,
					info: layerCreationInfo.metadata,
					dataset: feature,
					colorMapName: layerCreationInfo.colormap_name,
					classificationMethod: layerCreationInfo.classification_method,
					classificationMethod_2: layerCreationInfo.classification_method_2
				},
				...$layerListStore
			];
			await loadMap($map);
		} catch (err) {
			toast.push(err.message);
			console.error(err);
		} finally {
			layerLoading = false;
		}
	};

	const handleStarDeleted = () => {
		if (onStarDeleted) onStarDeleted();
	};

	const handleLayerTypeChanged = () => {
		layerCreationInfo = undefined;
	};

	const handleLayerAdded = (data: LayerCreationInfo) => {
		layerCreationInfo = data;
	};
</script>

<Accordion title={accordionTitle} bind:isExpanded={isExpanded as boolean}>
	{#snippet buttons()}
		<div>
			{#if !isExpanded}
				<AddLayerButton
					bind:isLoading={layerLoading}
					title="Add layer"
					isIconButton={true}
					onclick={addLayer}
				/>
			{/if}
		</div>
	{/snippet}
	{#snippet content()}
		<div class="container pb-2" bind:clientWidth>
			{#if isExpanded === true}
				{#if isShowInfo}
					<DataCardInfo bind:feature bind:metadata onStarDeleted={handleStarDeleted}>
						<div class="map">
							<MiniMap
								bind:feature
								{width}
								height={'200px'}
								bind:isLoadMap={isExpanded}
								bind:metadata
								bind:layer
								bind:layerType
								onLayerAdded={handleLayerAdded}
							/>
						</div>
					</DataCardInfo>
				{:else}
					<div class="map">
						<MiniMap
							bind:feature
							{width}
							height={'200px'}
							bind:isLoadMap={isExpanded}
							bind:metadata
							bind:layer
							bind:layerType
							onLayerAdded={handleLayerAdded}
						/>
					</div>
				{/if}

				<LayerTypeSwitch bind:layer bind:layerType size="small" onchange={handleLayerTypeChanged} />
				{#if layerCreationInfo}
					<AddLayerButton bind:isLoading={layerLoading} title="Add layer" onclick={addLayer} />
				{/if}
			{/if}
		</div>
	{/snippet}
</Accordion>

<style>
	.map {
		padding-bottom: 0.5rem;
	}
</style>
