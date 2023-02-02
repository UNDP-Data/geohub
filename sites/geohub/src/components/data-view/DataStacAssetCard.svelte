<script lang="ts">
  import type { AssetOptions, BannerMessage, StacItemFeature } from '$lib/types'
  import { Accordion } from '@undp-data/svelte-undp-design'
  import AddLayerButton from '$components/data-view/AddLayerButton.svelte'
  import { map, layerList, indicatorProgress, bannerMessages } from '$stores'
  import { MosaicJsonData } from '$lib/MosaicJsonData'
  import { StatusTypes } from '$lib/constants'
    import { loadMap } from '$lib/helper'

  export let asset: AssetOptions
  export let feature: StacItemFeature
  export let isExpanded = false

  const addStacMosaicLayer = async (asset: AssetOptions) => {
    try {
      $indicatorProgress = true
      const mosaicjson = new MosaicJsonData($map, feature, asset.url, asset.assetName)
      const data = await mosaicjson.add()

      $layerList = [
        {
          id: data.layer.id,
          name: `${asset.collectionId}-${asset.title}`,
          info: data.metadata,
          dataset: feature,
        },
        ...$layerList,
      ]
      await loadMap($map)
    } catch (err) {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.WARNING,
        title: 'Whoops! Something went wrong.',
        message: err.message,
        error: err,
      }
      bannerMessages.update((data) => [...data, bannerErrorMessage])
      console.error(err)
    } finally {
      $indicatorProgress = false
    }
  }
</script>

<Accordion
  headerTitle={asset.title}
  bind:isExpanded
  fontSize="small">
  <div slot="button">
    {#if !isExpanded}
      <AddLayerButton
        title="Add layer"
        isIconButton={true}
        on:clicked={() => addStacMosaicLayer(asset)} />
    {/if}
  </div>
  <div
    class="container pb-2"
    slot="content">
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
      title="Add layer"
      on:clicked={() => addStacMosaicLayer(asset)} />
  </div>
</Accordion>
