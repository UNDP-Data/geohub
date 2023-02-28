<script lang="ts">
  import type {
    BannerMessage,
    DatasetFeature,
    RasterTileMetadata,
    VectorLayerTileStatLayer,
    VectorTileMetadata,
  } from '$lib/types'
  import { Accordion, Radios, type Radio } from '@undp-data/svelte-undp-design'
  import AddLayerButton from '$components/data-view/AddLayerButton.svelte'
  import { map, layerList, indicatorProgress, bannerMessages } from '$stores'
  import { StatusTypes } from '$lib/constants'
  import { VectorTileData } from '$lib/VectorTileData'
  import MiniMap from './MiniMap.svelte'
  import DataCardInfo from './DataCardInfo.svelte'
  import { loadMap } from '$lib/helper'
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let layer: VectorLayerTileStatLayer
  export let feature: DatasetFeature
  export let isExpanded = false
  export let defaultColor: string
  export let metadata: RasterTileMetadata | VectorTileMetadata
  export let isShowInfo = false

  let vectorInfo = metadata as VectorTileMetadata
  let clientWidth: number
  $: width = `${clientWidth * 0.95}px`

  let layerLoading = false

  let symbolVectorType: 'point' | 'heatmap' = 'point'

  let symbolVectorTypes: Radio[] = [
    {
      label: 'Point',
      value: 'point',
    },
    {
      label: 'Heatmap',
      value: 'heatmap',
    },
  ]

  let polygonVectorType: 'polygon' | 'linestring' = 'polygon'
  let polygonVectorTypes: Radio[] = [
    {
      label: 'Polygon',
      value: 'polygon',
    },
    {
      label: 'Line',
      value: 'linestring',
    },
  ]

  const addLayer = async () => {
    try {
      $indicatorProgress = true
      layerLoading = true
      let layerType: 'point' | 'heatmap' | 'polygon' | 'linestring'
      if (['point', 'multipoint'].includes(layer.geometry.toLowerCase())) {
        layerType = symbolVectorType
      } else if (['polygon', 'multipolygon'].includes(layer.geometry.toLowerCase())) {
        layerType = polygonVectorType
      }
      const vectorInfo = metadata as VectorTileMetadata
      const vectorTile = new VectorTileData(feature, vectorInfo)
      const data = await vectorTile.add($map, layerType, defaultColor, layer.layer)

      let name = `${feature.properties.name}`
      if (!isShowInfo) {
        name = `${layer.layer} - ${name}`
      }
      $layerList = [
        {
          id: data.layer.id,
          name: name,
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
      layerLoading = false
    }
  }

  const handleStarDeleted = (e) => {
    dispatch('starDeleted', e.detail)
  }
</script>

<Accordion
  headerTitle={vectorInfo.json.vector_layers.length > 1 ? layer.layer : feature.properties.name}
  bind:isExpanded
  fontSize={isShowInfo ? 'medium' : 'small'}>
  <div slot="button">
    {#if !isExpanded}
      <AddLayerButton
        bind:isLoading={layerLoading}
        title="Add layer"
        isIconButton={true}
        on:clicked={addLayer} />
    {/if}
  </div>
  <div
    class="container pb-2"
    slot="content"
    bind:clientWidth>
    {#if isShowInfo}
      <DataCardInfo
        bind:feature
        bind:metadata
        on:starDeleted={handleStarDeleted}>
        <div class="map">
          <MiniMap
            bind:feature
            bind:width
            height={'150px'}
            bind:isLoadMap={isExpanded}
            bind:metadata
            bind:defaultColor
            bind:layer />
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
          bind:layer />
      </div>
    {/if}

    {#if ['point', 'multipoint'].includes(layer.geometry.toLocaleLowerCase())}
      <p class="subtitle is-6 m-0 p-0 pb-1">Select layer type before adding layer.</p>

      <div class="vector-symbol-radios">
        <Radios
          bind:radios={symbolVectorTypes}
          bind:value={symbolVectorType}
          groupName="vector-symbol-type-{layer.layer}"
          isVertical={false} />
      </div>
    {:else if ['polygon', 'multipolygon'].includes(layer.geometry.toLocaleLowerCase())}
      <p class="subtitle is-6 m-0 p-0 pb-1">Select layer type before adding layer.</p>

      <div class="vector-polygon-radios">
        <Radios
          bind:radios={polygonVectorTypes}
          bind:value={polygonVectorType}
          groupName="vector-polygon-type-{layer.layer}"
          isVertical={false} />
      </div>
    {/if}

    <AddLayerButton
      bind:isLoading={layerLoading}
      title="Add layer"
      on:clicked={addLayer} />
  </div>
</Accordion>

<style>
  .map {
    padding-bottom: 0.5rem;
  }

  .vector-symbol-radios,
  .vector-polygon-radios {
    padding-bottom: 0.5rem;
  }
</style>
