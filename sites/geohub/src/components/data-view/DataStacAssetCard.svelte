<script lang="ts">
	import AddLayerButton from '$components/data-view/AddLayerButton.svelte';
	import { MosaicJsonData } from '$lib/MosaicJsonData';
	import { loadMap } from '$lib/helper';
	import type { AssetOptions, DatasetFeature } from '$lib/types';
	import { layerList, map } from '$stores';
	import { Accordion } from '@undp-data/svelte-undp-design';
	import { toast } from '@zerodevx/svelte-toast';

	export let asset: AssetOptions;
	export let feature: DatasetFeature;
	export let isExpanded = false;

	let layerLoading = false;
	const addStacMosaicLayer = async (asset: AssetOptions) => {
		try {
			layerLoading = true;
			const mosaicjson = new MosaicJsonData(feature, asset.url, asset.assetName);
			const data = await mosaicjson.add($map);

			$layerList = [
				{
					id: data.layer.id,
					name: `${asset.collectionId}-${asset.title}`,
					info: data.metadata,
					dataset: feature,
					colorMapName: data.colormap
				},
				...$layerList
			];
			await loadMap($map);
		} catch (err) {
			console.error(err);
			toast.push(err.message);
		} finally {
			layerLoading = false;
		}
	};
</script>

<Accordion headerTitle={asset.title} bind:isExpanded fontSize="small">
	<div slot="button">
		{#if !isExpanded}
			<AddLayerButton
				bind:isLoading={layerLoading}
				title="Add layer"
				isIconButton={true}
				on:clicked={() => addStacMosaicLayer(asset)}
			/>
		{/if}
	</div>
	<div class="container pb-2" slot="content">
		<div class="description">
			{#if asset.asset.description}
				<p><b>Description: </b>{asset.asset.description}</p>
			{/if}
			<p><b>Type: </b>{asset.asset.type}</p>
			{#if asset.asset['raster:bands'] && asset.asset['raster:bands'].length > 0}
				{#if asset.asset['raster:bands'][0].name}
					<p><b>Band name: </b>{asset.asset['raster:bands'][0].name}</p>
				{/if}
				{#if asset.asset['raster:bands'][0].description}
					<p><b>Band description: </b>{asset.asset['raster:bands'][0].description}</p>
				{/if}
				{#if asset.asset['raster:bands'][0].sampling}
					<p><b>Sampling: </b>{asset.asset['raster:bands'][0].sampling}</p>
				{/if}
				{#if asset.asset['raster:bands'][0].spatial_resolution}
					<p><b>Spatial resolution: </b>{asset.asset['raster:bands'][0].spatial_resolution}</p>
				{/if}
			{/if}
		</div>
		<AddLayerButton
			bind:isLoading={layerLoading}
			title="Add layer"
			on:clicked={() => addStacMosaicLayer(asset)}
		/>
	</div>
</Accordion>
