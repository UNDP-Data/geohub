<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import ColorMapPicker from '$components/controls/ColorMapPicker.svelte'
  import RasterContinuousLegend from '$components/controls/RasterContinuousLegend.svelte'
  import RasterIntervalsLegend from '$components/controls/RasterIntervalsLegend.svelte'
  import RasterUniqueValuesLegend from '$components/controls/RasterUniqueValuesLegend.svelte'
  import { DynamicLayerLegendTypes, COLOR_CLASS_COUNT_MAXIMUM, ClassificationMethodTypes } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { layerList, map } from '$stores'
  import {
    getActiveBandIndex,
    fetchUrl,
    updateParamsInURL,
    getValueFromRasterTileUrl,
    getLayerStyle,
    getRandomColormap,
  } from '$lib/helper'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import type { RasterTileSource } from 'maplibre-gl'

  export let layer: Layer
  export let colorMapName: string =
    (getValueFromRasterTileUrl($map, layer.id, 'colormap_name') as string) ?? getRandomColormap()
  export let classificationMethod: ClassificationMethodTypes

  let info
  ;({ info } = layer)

  let layerStats
  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
  let layerHasUniqueValues = false
  let layerListCount = $layerList.length
  let showTooltip = false
  let numberOfClasses: number
  export let legendType: DynamicLayerLegendTypes = undefined

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let bandIndex = getActiveBandIndex(layer.info)

  // hide colormap picker if change in layer list
  $: {
    if (layerListCount !== $layerList.length) {
      showTooltip = false
      layerListCount = $layerList.length
    }
  }

  onMount(async () => {
    const layerSrc: RasterTileSource = $map.getSource(getLayerStyle($map, layer.id).source) as RasterTileSource
    if (layerSrc?.tiles?.length > 0) {
      await initialise()
    } else {
      setTimeout(initialise, 300)
    }
  })

  const initialise = async () => {
    const rasterInfo = layer.info as RasterTileMetadata
    if (!rasterInfo?.isMosaicJson) {
      const layerSrc: RasterTileSource = $map.getSource(getLayerStyle($map, layer.id).source) as RasterTileSource
      if (!(layerSrc?.tiles?.length > 0)) return
      const layerURL = new URL(layerSrc.tiles[0])
      const statsURL = `${PUBLIC_TITILER_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}`
      layerStats = await fetchUrl(statsURL)
      const band = info.active_band_no

      layerHasUniqueValues = Number(layerStats[band]['unique']) <= COLOR_CLASS_COUNT_MAXIMUM
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
    legendType = legendType ? legendType : DynamicLayerLegendTypes.CONTINUOUS
  }

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-end',
      strategy: 'fixed',
    },
    [10, 15],
  ).init()

  const handleLegendToggleClick = () => {
    colorPickerVisibleIndex = -1
    isLegendSwitchAnimate = true
    let bandName
    const rasterInfo = layer.info as RasterTileMetadata
    try {
      bandName = Object.keys(rasterInfo.stats)
    } catch (e) {
      console.log(e)
    }
    layerHasUniqueValues =
      Number(rasterInfo.stats[bandName]['unique']) <= COLOR_CLASS_COUNT_MAXIMUM && !rasterInfo.dtype.startsWith('float')

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    if (legendType === DynamicLayerLegendTypes.CONTINUOUS) {
      legendType = layerHasUniqueValues ? DynamicLayerLegendTypes.UNIQUE : DynamicLayerLegendTypes.INTERVALS
    } else {
      legendType = DynamicLayerLegendTypes.CONTINUOUS
    }
  }

  $: colorMapName, colorMapChanged()
  const colorMapChanged = () => {
    if (!colorMapName) return
    const rasterInfo = layer.info as RasterTileMetadata
    const source: RasterTileSource = $map.getSource($map.getLayer(layer.id).source) as RasterTileSource
    const tiles = source.tiles
    if (!(tiles && tiles.length > 0)) return
    const layerURL = new URL(tiles[0])
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    const rescale = getValueFromRasterTileUrl($map, layer.id, 'rescale') as number[]
    let updatedParams = Object.assign({ colormap_name: colorMapName })
    if (rescale) {
      updatedParams = Object.assign(updatedParams, { rescale: rescale.join(',') })
    }
    const layerStyle = getLayerStyle($map, layer.id)
    updateParamsInURL(layerStyle, layerURL, updatedParams)

    colorPickerVisibleIndex = -1
    const nlayer = { ...layer }
    const layers = $layerList.map((lyr) => {
      return layer.id !== lyr.id ? lyr : nlayer
    })
    layerList.set([...layers])
  }

  const handleClosePopup = () => {
    showTooltip = !showTooltip
    colorPickerVisibleIndex = -1
  }

  const handleEnterKeyForSwitch = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleLegendToggleClick()
    }
  }
  const handleEnterKeyForColor = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleClosePopup()
    }
  }
</script>

<div class="columns">
  <div class="column is-10">
    {#if legendType === DynamicLayerLegendTypes.CONTINUOUS}
      <div transition:slide>
        <RasterContinuousLegend
          bind:layerConfig={layer}
          bind:colorMapName
          bind:numberOfClasses />
      </div>
    {:else if legendType === DynamicLayerLegendTypes.INTERVALS}
      <div transition:slide>
        <RasterIntervalsLegend
          bind:layerConfig={layer}
          bind:colorPickerVisibleIndex
          bind:colorMapName
          bind:classificationMethod
          bind:numberOfClasses />
      </div>
    {:else if legendType === DynamicLayerLegendTypes.UNIQUE}
      <div transition:slide>
        <RasterUniqueValuesLegend
          bind:layerConfig={layer}
          bind:colorPickerVisibleIndex
          bind:colorMapName />
      </div>
    {/if}
  </div>
  <div
    class="columm legend-toggle"
    transition:slide>
    <div
      role="button"
      class="toggle-container has-tooltip-left has-tooltip-arrow icon m-1"
      aria-label="Switch Legend Type"
      data-tooltip="Toggle Legend Type"
      tabindex="0"
      on:keydown={handleEnterKeyForSwitch}
      on:click={handleLegendToggleClick}
      data-testid="legend-toggle-container">
      <i
        class="fa-solid fa-retweet {isLegendSwitchAnimate ? 'fa-spin' : ''}"
        style="font-size: 16px; color: white" />
    </div>
    <br />
    <div
      role="button"
      class="toggle-container has-tooltip-left has-tooltip-arrow m-1"
      aria-label="Open Color Scheme Picker"
      data-tooltip="Change color map"
      tabindex="0"
      use:popperRef
      on:keydown={handleEnterKeyForColor}
      on:click={handleClosePopup}
      data-testid="colormap-toggle-container">
      <i
        class="fa-solid fa-palette"
        style="font-size: 16px; color: white" />
    </div>

    {#if showTooltip}
      <div
        id="tooltip"
        data-testid="tooltip"
        use:popperContent={popperOptions}
        transition:fade>
        <ColorMapPicker
          on:handleClosePopup={handleClosePopup}
          layerMin={Number(layer.info['band_metadata'][bandIndex]['1']['STATISTICS_MINIMUM'])}
          layerMax={Number(layer.info['band_metadata'][bandIndex]['1']['STATISTICS_MAXIMUM'])}
          bind:colorMapName
          bind:numberOfClasses />
        <div
          id="arrow"
          data-popper-arrow />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import 'src/styles/popper.scss';

  .legend-toggle {
    padding-top: 15px;

    .toggle-container {
      margin-left: 3.5px;
      background: #d12800;
      padding: 10px;
      width: 32px;
      height: 32px;
      border-radius: 5px;
      cursor: pointer;
    }
  }

  #tooltip {
    max-height: 300px;
    max-width: 470px;
  }
</style>
