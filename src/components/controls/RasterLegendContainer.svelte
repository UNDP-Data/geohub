<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'

  import ColorMapPicker from '$components/controls/ColorMapPicker.svelte'
  import RasterContinuousLegend from '$components/controls/RasterContinuousLegend.svelte'
  import RasterIntervalsLegend from '$components/controls/RasterIntervalsLegend.svelte'
  import RasterUniqueValuesLegend from '$components/controls/RasterUniqueValuesLegend.svelte'
  import { DynamicLayerLegendTypes, COLOR_CLASS_COUNT_MAXIMUM } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'
  import {
    getActiveBandIndex,
    fetchUrl,
    updateParamsInURL,
    getValueFromRasterTileUrl,
    getLayerStyle,
  } from '$lib/helper'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import type { RasterTileSource } from 'maplibre-gl'

  export let layer: Layer

  let info
  ;({ info } = layer)

  let layerStats
  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
  let layerHasUniqueValues = false
  let layerListCount = $layerList.length
  let showTooltip = false
  export let colorMapName: string

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
    if (!layer.tree?.isMosaicJSON) {
      const layerSrc: RasterTileSource = $map.getSource(getLayerStyle($map, layer.id).source) as RasterTileSource
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
    layer.legendType = layer.legendType ? layer.legendType : DynamicLayerLegendTypes.CONTINUOUS
  })

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
    try {
      bandName = Object.keys(layer.info.stats)
    } catch (e) {
      console.log(e)
    }
    layerHasUniqueValues =
      Number(layer.info.stats[bandName]['unique']) <= COLOR_CLASS_COUNT_MAXIMUM && !layer.info.dtype.startsWith('float')

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    if (layer.legendType === DynamicLayerLegendTypes.CONTINUOUS) {
      layer.legendType = layerHasUniqueValues ? DynamicLayerLegendTypes.UNIQUE : DynamicLayerLegendTypes.INTERVALS
    } else {
      layer.legendType = DynamicLayerLegendTypes.CONTINUOUS
    }
  }

  $: colorMapName, colorMapChanged()
  const colorMapChanged = () => {
    if (!colorMapName) return
    if (layer.tree?.isMosaicJSON) {
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
    }

    colorPickerVisibleIndex = -1
    const nlayer = { ...layer, colorMapName: colorMapName }
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
    {#if layer.legendType === DynamicLayerLegendTypes.CONTINUOUS}
      <div transition:slide>
        <RasterContinuousLegend
          bind:layerConfig={layer}
          bind:colorMapName />
      </div>
    {:else if layer.legendType === DynamicLayerLegendTypes.INTERVALS}
      <div transition:slide>
        <RasterIntervalsLegend
          bind:layerConfig={layer}
          bind:colorPickerVisibleIndex
          bind:colorMapName />
      </div>
    {:else if layer.legendType === DynamicLayerLegendTypes.UNIQUE}
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
    <Wrapper>
      <div
        role="button"
        class="toggle-container"
        aria-label="Switch Legend Type"
        on:click={handleLegendToggleClick}
        data-testid="legend-toggle-container">
        <Card
          on:keydown={handleEnterKeyForSwitch}
          style="background: #D12800;">
          <PrimaryAction style="padding: 10px;">
            <Fa
              icon={faRetweet}
              style="font-size: 16px; color: white"
              spin={isLegendSwitchAnimate} />
          </PrimaryAction>
        </Card>
      </div>
      <Tooltip
        showDelay={1000}
        hideDelay={0}
        yPos="above">Toggle Legend Type</Tooltip>
    </Wrapper>
    <br />
    <Wrapper>
      <div
        role="button"
        class="toggle-container"
        aria-label="Open Color Scheme Picker"
        use:popperRef
        on:click={handleClosePopup}
        data-testid="colormap-toggle-container">
        <Card
          on:keydown={handleEnterKeyForColor}
          style="background: #D12800;">
          <PrimaryAction style="padding: 10px;">
            <Fa
              icon={faPalette}
              style="font-size: 16px; color: white" />
          </PrimaryAction>
        </Card>
      </div>
      <Tooltip
        showDelay={1000}
        hideDelay={0}
        yPos="above">Change color map</Tooltip>
    </Wrapper>

    {#if showTooltip}
      <div
        id="tooltip"
        data-testid="tooltip"
        use:popperContent={popperOptions}
        transition:fade>
        <ColorMapPicker
          on:handleClosePopup={handleClosePopup}
          {layer}
          layerMin={Number(layer.info['band_metadata'][bandIndex]['1']['STATISTICS_MINIMUM'])}
          layerMax={Number(layer.info['band_metadata'][bandIndex]['1']['STATISTICS_MAXIMUM'])}
          bind:colorMapName />
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
    }
  }

  #tooltip {
    max-height: 300px;
    max-width: 470px;
  }
</style>
