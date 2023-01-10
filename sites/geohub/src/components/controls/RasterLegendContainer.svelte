<script lang="ts">
  import { onMount, onDestroy, setContext, getContext } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import ColorMapPicker from '$components/controls/ColorMapPicker.svelte'
  import RasterContinuousLegend from '$components/controls/RasterContinuousLegend.svelte'
  import RasterIntervalsLegend from '$components/controls/RasterIntervalsLegend.svelte'
  import RasterUniqueValuesLegend from '$components/controls/RasterUniqueValuesLegend.svelte'
  import {
    DynamicLayerLegendTypes,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT,
    ClassificationMethodTypes,
  } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { layerList, map } from '$stores'
  import {
    getActiveBandIndex,
    fetchUrl,
    updateParamsInURL,
    getValueFromRasterTileUrl,
    getLayerStyle,
    getLayerSourceUrl,
    sleep,
  } from '$lib/helper'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'

  export let layer: Layer
  export let legendType: DynamicLayerLegendTypes = undefined
  export let classificationMethod: ClassificationMethodTypes
  export let fakeProp: string
  let info
  ;({ info } = layer)

  let classification: ClassificationMethodTypes = classificationMethod

  let layerStats
  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
  let layerHasUniqueValues = false
  let showTooltip = false
  let numberOfClasses: number = COLOR_CLASS_COUNT
  // let vizMode: 'continuous' | 'discrete' | undefined = undefined
  let colorMapName: string

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let bandIndex = getActiveBandIndex(layer.info)

  onMount(async () => {
    while ($map.loaded() === false) {
      await sleep(100)
    }

    /**
     * a raster layer can at any goven time be in two visualization contexts:
     *  1. continuous colormap_name param in url
     *  2. discrete (classes) colormap parameter
     *
     * These two mode are MUTUALLY exlcusive, that is only ONE can be active at any given time instance
     * That means whenever the mode is changed this is done by removing the other mode from the url
     */

    const colormap = getValueFromRasterTileUrl($map, layer.id, 'colormap')

    if (colormap) {
      // either unique or interval
      const rasterInfo = layer.info as RasterTileMetadata
      const band = info.active_band_no
      layerHasUniqueValues = false
      if (rasterInfo.stats[band] && rasterInfo.stats[band]['unique']) {
        layerHasUniqueValues = Number(rasterInfo.stats[band]['unique']) <= COLOR_CLASS_COUNT_MAXIMUM
      }
      if (layerHasUniqueValues) {
        legendType = DynamicLayerLegendTypes.UNIQUE
      } else {
        legendType = DynamicLayerLegendTypes.INTERVALS
      }
    } else {
      // continuous
      colorMapName = (getValueFromRasterTileUrl($map, layer.id, 'colormap_name') as string) || colorMapName

      legendType = DynamicLayerLegendTypes.CONTINUOUS
    }

    // initialisation is not necessary when restoring or swhitching from other tabs
    if (!('stats' in layer.info)) await initialise()

    //console.log('RLCMOUNT', colorMapName, classificationMethod, numberOfClasses)
  })

  const initialise = async () => {
    const rasterInfo = layer.info as RasterTileMetadata
    if (!rasterInfo?.isMosaicJson) {
      const layerUrl = getLayerSourceUrl($map, layer.id) as string

      const layerURL = new URL(layerUrl)

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
          bind:classificationMethod={classification}
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
