<script lang="ts">
	import { page } from '$app/stores';
	import AddLayerButton from '$components/data-view/AddLayerButton.svelte';
	import { VectorTileData } from '$lib/VectorTileData';
	import { LineTypes } from '$lib/config/AppConfig/LineTypes';
	import { loadMap } from '$lib/helper';
	import type {
		DatasetFeature,
		RasterTileMetadata,
		VectorLayerTileStatLayer,
		VectorTileMetadata
	} from '$lib/types';
	import { layerList, map } from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';
	import { createEventDispatcher } from 'svelte';
	import DataCardInfo from './DataCardInfo.svelte';
	import LayerTypeSwitch from './LayerTypeSwitch.svelte';
	import MiniMap from './MiniMap.svelte';

	const dispatch = createEventDispatcher();

	export let layer: VectorLayerTileStatLayer;
	export let feature: DatasetFeature;
	export let isExpanded = false;
	export let defaultColor: string;
	export let metadata: RasterTileMetadata | VectorTileMetadata;
	export let isShowInfo = false;

	const generateLineDashFromPattern = (pattern: string) => {
		return LineTypes.find((lineType) => lineType.title === pattern)?.value as number[];
	};
	let defaultLineWidth = $page.data.config.LineWidth;
	let defaultLineDashArray = generateLineDashFromPattern($page.data.config.LinePattern);
	let defaultIconSize = $page.data.config.IconSize;
	let defaultIconImage = $page.data.config.IconImage;
	let iconOverlap = $page.data.config.IconOverlapPriority;
	let layerOpacity = $page.data.config.LayerOpacity / 100;

	let vectorInfo = metadata as VectorTileMetadata;
	let clientWidth: number;
	$: width = `${clientWidth * 0.95}px`;

	let layerLoading = false;

	let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring';

	const addLayer = async () => {
		try {
			layerLoading = true;

			const vectorInfo = metadata as VectorTileMetadata;
			const vectorTile = new VectorTileData(
				feature,
				defaultLineWidth,
				defaultLineDashArray,
				vectorInfo,
				defaultIconImage,
				defaultIconSize,
				iconOverlap,
				layerOpacity
			);
			const data = await vectorTile.add($map, layerType, defaultColor, layer.layer);

			let name = `${feature.properties.name}`;
			if (!isShowInfo) {
				name = `${layer.layer} - ${name}`;
			}
			$layerList = [
				{
					id: data.layer.id,
					name: name,
					info: data.metadata,
					dataset: feature
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
