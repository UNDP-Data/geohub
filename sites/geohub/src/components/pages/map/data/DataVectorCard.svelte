<script lang="ts">
	import AddLayerButton from '$components/pages/map/data/AddLayerButton.svelte';
	import DataCardInfo from '$components/pages/map/data/DataCardInfo.svelte';
	import LayerTypeSwitch from '$components/util/LayerTypeSwitch.svelte';
	import MiniMap from '$components/util/MiniMap.svelte';
	import { VectorTileData } from '$lib/VectorTileData';
	import { loadMap } from '$lib/helper';
	import type {
		DatasetFeature,
		RasterTileMetadata,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import { MAPSTORE_CONTEXT_KEY, layerList, type MapStore } from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import { createEventDispatcher, getContext } from 'svelte';

	const map: MapStore = getContext(MAPSTORE_CONTEXT_KEY);

	const dispatch = createEventDispatcher();

	export let layer: VectorLayerTileStatLayer;
	export let feature: DatasetFeature;
	export let isExpanded = false;
	export let defaultColor: string;
	export let metadata: RasterTileMetadata | VectorTileMetadata;
	export let isShowInfo = false;

	let vectorInfo = metadata as VectorTileMetadata;
	let clientWidth: number;
	$: width = `${clientWidth * 0.95}px`;

	let layerLoading = false;

	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring';

	const addLayer = async () => {
		try {
			layerLoading = true;

			const vectorInfo = metadata as VectorTileMetadata;
			const vectorTile = new VectorTileData(feature, vectorInfo);
			const data = await vectorTile.add($map, layerType, layer.layer);

			let name = `${feature.properties.name}`;
			if (!isShowInfo) {
				name = `${layer.layer} - ${name}`;
			}
			$layerList = [
				{
					id: data.layer.id,
					name: name,
					info: data.metadata,
					dataset: feature,
					colorMapName: data.colormap_name,
					classificationMethod: data.classification_method
				},
				...$layerList
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
</script>

<Accordion
	headerTitle={vectorInfo.json.vector_layers.length > 1 ? layer.layer : feature.properties.name}
	bind:isExpanded
	fontSize={isShowInfo ? 'medium' : 'small'}
>
	<div slot="button">
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
						bind:defaultColor
						bind:layer
						bind:layerType
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
					bind:defaultColor
					bind:layer
					bind:layerType
				/>
			</div>
		{/if}

		<LayerTypeSwitch bind:layer bind:layerType />
		<AddLayerButton bind:isLoading={layerLoading} title="Add layer" on:clicked={addLayer} />
	</div>
</Accordion>

<style>
	.map {
		padding-bottom: 0.5rem;
	}
</style>
