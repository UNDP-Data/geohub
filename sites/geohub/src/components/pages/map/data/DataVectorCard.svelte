<script lang="ts">
	import { page } from '$app/stores';
	import AddLayerButton from '$components/pages/map/data/AddLayerButton.svelte';
	import DataCardInfo from '$components/pages/map/data/DataCardInfo.svelte';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import MiniMap from '$components/util/MiniMap.svelte';
	import { VectorTileData } from '$lib/VectorTileData';
	import type { UserConfig } from '$lib/config/DefaultUserConfig';
	import { loadMap } from '$lib/helper';
	import type {
		DatasetFeature,
		LayerCreationInfo,
		RasterTileMetadata,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import {
		LAYERLISTSTORE_CONTEXT_KEY,
		MAPSTORE_CONTEXT_KEY,
		type LayerListStore,
		type MapStore
	} from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-components';
	import { toast } from '@zerodevx/svelte-toast';
	import { LngLatBounds } from 'maplibre-gl';
	import { createEventDispatcher, getContext } from 'svelte';
	import { v4 as uuidv4 } from 'uuid';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);
	const layerListStore: LayerListStore = getContext(LAYERLISTSTORE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layer: VectorLayerTileStatLayer;
	export let feature: DatasetFeature;
	export let isExpanded = false;
	export let metadata: RasterTileMetadata | VectorTileMetadata;
	export let isShowInfo = false;

	let config: UserConfig = $page.data.config;

	let vectorInfo = metadata as VectorTileMetadata;
	let clientWidth: number;
	$: width = `${clientWidth * 0.95}px`;

	let layerLoading = false;

	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring' | 'circle';

	let layerCreationInfo: LayerCreationInfo;

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

	const handleStarDeleted = (e) => {
		dispatch('starDeleted', e.detail);
	};

	$: layerType, handleLayerTypeChanged();
	const handleLayerTypeChanged = () => {
		layerCreationInfo = undefined;
	};

	const handleLayerAdded = (e: { detail: LayerCreationInfo }) => {
		layerCreationInfo = e.detail;
	};
</script>

<Accordion
	title={vectorInfo.json.vector_layers.length > 1 ? layer.layer : feature.properties.name}
	bind:isExpanded
>
	<div slot="buttons">
		{#if !isExpanded}
			<AddLayerButton
				bind:isLoading={layerLoading}
				title="Add layer"
				isIconButton={true}
				on:clicked={addLayer}
			/>
		{/if}
	</div>
	<div class="container pb-2" slot="content" bind:clientWidth>
		{#if isShowInfo}
			<DataCardInfo bind:feature bind:metadata on:starDeleted={handleStarDeleted}>
				<div class="map">
					<MiniMap
						bind:feature
						bind:width
						height={'150px'}
						bind:isLoadMap={isExpanded}
						bind:metadata
						bind:layer
						bind:layerType
						on:layerAdded={handleLayerAdded}
					/>
				</div>
			</DataCardInfo>
		{:else}
			<div class="map">
				<MiniMap
					bind:feature
					bind:width
					height={'150px'}
					bind:isLoadMap={isExpanded}
					bind:metadata
					bind:layer
					bind:layerType
					on:layerAdded={handleLayerAdded}
				/>
			</div>
		{/if}

		<LayerTypeSwitch bind:layer bind:layerType />
		{#if layerCreationInfo}
			<AddLayerButton bind:isLoading={layerLoading} title="Add layer" on:clicked={addLayer} />
		{/if}
	</div>
</Accordion>

<style>
	.map {
		padding-bottom: 0.5rem;
	}
</style>
