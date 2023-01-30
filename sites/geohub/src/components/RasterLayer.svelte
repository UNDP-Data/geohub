<script lang="ts">
  import { map, layerList } from '$stores'
  import { fade } from 'svelte/transition'
  import RasterLegend from '$components/controls/RasterLegend.svelte'
  import RasterExpression from '$components/controls/RasterExpression.svelte'
  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import {
    ClassificationMethodTypes,
    TabNames,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT,
    LegendTypes,
  } from '$lib/constants'
  import type {
    IntervalLegendColorMapRow,
    Layer,
    RasterLayerStats,
    RasterSimpleExpression,
    RasterTileMetadata,
  } from '$lib/types'
  import RasterHistogram from '$components/controls/RasterHistogram.svelte'
  import { Loader, Tabs } from '@undp-data/svelte-undp-design'
  import {
    getValueFromRasterTileUrl,
    sleep,
    getLayerSourceUrl,
    fetchUrl,
    getActiveBandIndex,
    remapInputValue,
  } from '$lib/helper'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'

  // exports
  export let layer: Layer
  export let classificationMethod: ClassificationMethodTypes
  export let colorMapName: string

  //local vars
  let tabs = [
    { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
    { label: TabNames.HISTOGRAM, icon: 'fa-solid fa-chart-column' },
    { label: TabNames.TRANSFORM, icon: 'fa-solid fa-shuffle' },
    { label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' },
  ]
  let { info }: Layer = layer
  const bandIndex = getActiveBandIndex(info)
  const [band, bandMetaStats] = info['band_metadata'][bandIndex]
  let layerHasUniqueValues = Object.keys(bandMetaStats['STATISTICS_UNIQUE_VALUES']).length > 0
  let legendLabels = {}
  if (layerHasUniqueValues) {
    legendLabels = bandMetaStats['STATISTICS_UNIQUE_VALUES']
  }
  let activeTab = TabNames.LEGEND
  let layerStats: RasterLayerStats

  // state vars
  //let expressions: RasterSimpleExpression[]
  let legendType: LegendTypes
  let classification: ClassificationMethodTypes = classificationMethod
  let cMapName: string = colorMapName
  let numberOfClasses: number = COLOR_CLASS_COUNT
  let colorMapRows: Array<IntervalLegendColorMapRow> = []

  /**
   * Force syncing with map lifecycle.
   * The svelte UI lifecycle is much faster but it has to be forced to "wait"
   * for the map&layers to be ready. This is done through sleep fucntion
   *
   * A little peculiar but doing this in onMount DOES NOT WORK
   *
   * while  onMount is async, it is execured after the children (RasterLegendContainer)
   * was mounted and thus, the forwarded "layer" prop does  not have the
   * optional stats property and possible others as well
   *
   * getURL IS executed earlier, thus the children are initialized with valid props
   *
   * This comes as a bit of counterintuitive but this is what i have found (IOAN)
   *
   */

  const getURL = async () => {
    while ($map.loaded() === false) {
      await sleep(100)
    }

    const colormap: object = getValueFromRasterTileUrl($map, layer.id, 'colormap')
    if (colormap) {
      //layer  is being loaded form a saved map and is classified
      if (layerHasUniqueValues) {
        colorMapRows = Object.keys(colormap).map((key, index) => {
          return {
            index: index,
            start: key,
            end: legendLabels[key],
            color: [
              colormap[key][0],
              colormap[key][1],
              colormap[key][2],
              remapInputValue(colormap[key][3], 0, 255, 0, 1),
            ],
          }
        })
      } else {
        colormap.forEach((row: number[][], index: number) => {
          const [start, end] = row[0]
          const color = row[1]
          colorMapRows.push({
            color: color,
            index: index,
            start: start,
            end: end,
          })
        })
      }

      numberOfClasses = colorMapRows.length
      legendType = LegendTypes.CLASSIFY
    } else {
      if (!cMapName) cMapName = getValueFromRasterTileUrl($map, layer.id, 'colormap_name') as string
      legendType = LegendTypes.DEFAULT
    }

    // initialisation is not necessary when restoring or swhitching from other tabs
    if (!('stats' in layer.info)) await initialise()

    return getValueFromRasterTileUrl($map, layer.id, 'url') as string
  }

  let url = getURL()

  const initialise = async () => {
    if (!(info as RasterTileMetadata)?.isMosaicJson) {
      const layerUrl = getLayerSourceUrl($map, layer.id) as string

      const layerURL = new URL(layerUrl)

      const statsURL = `${PUBLIC_TITILER_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}&histogram_bins=50`
      layerStats = await fetchUrl(statsURL)
      const band = (info as RasterTileMetadata).active_band_no
      if (layerHasUniqueValues) {
        const statsURL = `${PUBLIC_TITILER_ENDPOINT}/statistics?url=${layerURL.searchParams.get(
          'url',
        )}&categorical=true`
        layerStats = await fetchUrl(statsURL)
      }
      if (!('stats' in info)) {
        info = { ...info, stats: layerStats }
        layer = { ...layer, info: info }
        const layers = $layerList.map((lyr) => {
          return layer.id !== lyr.id ? lyr : layer
        })
        layerList.set([...layers])
      }
    }
  }

  if ((info as RasterTileMetadata)?.isMosaicJson === true) {
    // disable other menus since they are not working for mosaicjson layer currently
    tabs = [{ label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' }]
    if ((info as RasterTileMetadata).band_metadata.length < 2) {
      tabs = [
        { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
        { label: TabNames.HISTOGRAM, icon: 'fa-solid fa-chart-column' },
        ...tabs,
      ]
    }
  }

  $: {
    if (cMapName && $map) {
      // fire event for style sharing
      $map?.fire('colormap:changed', {
        layerId: layer.id,
        colorMapName: cMapName,
      })
    }
  }
</script>

<div
  class="raster-layer-container has-background-white-bis"
  transition:fade>
  <nav class="panel">
    <p class="panel-heading has-background-grey-lighter p-2">
      <LayerNameGroup {layer} />
    </p>

    {#await url}
      <div class="loader-container p-3">
        <Loader size="small" />
      </div>
    {:then uriValue}
      <Tabs
        bind:tabs
        bind:activeTab
        fontSize="medium"
        isToggleTab={true} />

      <p class="panel-content">
        {#if activeTab == TabNames.LEGEND}
          <RasterLegend
            bind:layer
            bind:classificationMethod={classification}
            bind:legendType
            bind:colorMapName={cMapName}
            bind:numberOfClasses
            bind:colorMapRows />
        {/if}
        {#if activeTab == TabNames.HISTOGRAM}
          <RasterHistogram bind:layer />
        {/if}
        {#if activeTab == TabNames.TRANSFORM}
          <RasterExpression bind:layer />
        {/if}
        {#if activeTab == TabNames.OPACITY}
          <OpacityPanel {layer} />
        {/if}
      </p>
    {/await}
  </nav>
</div>

<style lang="scss">
  .raster-layer-container {
    .panel-content {
      padding: 10px;
      padding-top: 15px;
    }
  }
  .loader-container {
    display: flex;
    align-items: center;
    width: fit-content;
    margin: 0 auto;
  }
</style>
