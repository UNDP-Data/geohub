<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'

  import ColorMapPicker from '$components/ColorMapPicker.svelte'
  import ContinuousLegend from '$components/ContinuousLegend.svelte'
  import IntervalsLegend from '$components/IntervalsLegend.svelte'
  import UniqueValuesLegend from '$components/UniqueValuesLegend.svelte'
  import { DynamicLayerLegendTypes, COLOR_CLASS_COUNT_MAXIMUM } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'
  import { getActiveBandIndex, fetchUrl } from '$lib/helper'
  import { TITILER_API_ENDPOINT } from '$lib/constants'
  import type {
    FillLayerSpecification,
    HeatmapLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types.g'

  export let layer: Layer

  let definition:
    | RasterLayerSpecification
    | FillLayerSpecification
    | LineLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  let info
  ;({ definition, info } = layer)
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
  let layerHasUniqueValues = false
  let layerListCount = $layerList.length
  let showTooltip = false
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let bandIndex = getActiveBandIndex(layer.info)

  console.log(bandIndex)

  // hide colormap picker if change in layer list
  $: {
    if (layerListCount !== $layerList.length) {
      showTooltip = false
      layerListCount = $layerList.length
    }
  }

  onMount(async () => {
    const statsURL = `${TITILER_API_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}`
    const layerStats = await fetchUrl(statsURL)
    const band = info.active_band_no

    layerHasUniqueValues = Number(layerStats[band]['unique']) <= COLOR_CLASS_COUNT_MAXIMUM
    if (layerHasUniqueValues) {
      const statsURL = `${TITILER_API_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}&categorical=true`
      await fetchUrl(statsURL)
    }
    if (!('stats' in info)) {
      info = { ...info, stats: layerStats }
      layer = { ...layer, info: info }
      const layers = $layerList.map((lyr) => {
        return layer.definition.id !== lyr.definition.id ? lyr : layer
      })
      layerList.set([...layers])
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
    layerHasUniqueValues = Number(layer.info.stats[bandName]['unique']) <= COLOR_CLASS_COUNT_MAXIMUM

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    if (layer.legendType === DynamicLayerLegendTypes.CONTINUOUS) {
      layer.legendType = layerHasUniqueValues ? DynamicLayerLegendTypes.UNIQUE : DynamicLayerLegendTypes.INTERVALS
    } else {
      layer.legendType = DynamicLayerLegendTypes.CONTINUOUS
    }
  }

  const handleColorMapClick = (event: CustomEvent) => {
    if (event?.detail?.colorMapName) {
      colorPickerVisibleIndex = -1
      const nlayer = { ...layer, colorMapName: event.detail.colorMapName }
      const layers = $layerList.map((lyr) => {
        return layer.definition.id !== lyr.definition.id ? lyr : nlayer
      })
      layerList.set([...layers])
    }
  }

  const handleClosePopup = () => {
    showTooltip = !showTooltip
    colorPickerVisibleIndex = -1
  }
</script>

<div class="columns">
  <div class="column is-10">
    {#if layer.legendType === DynamicLayerLegendTypes.CONTINUOUS}
      <div transition:slide>
        <ContinuousLegend bind:layerConfig={layer} />
      </div>
    {:else if layer.legendType === DynamicLayerLegendTypes.INTERVALS}
      <div transition:slide>
        <IntervalsLegend bind:layerConfig={layer} bind:colorPickerVisibleIndex />
      </div>
    {:else if layer.legendType === DynamicLayerLegendTypes.UNIQUE}
      <div transition:slide>
        <UniqueValuesLegend bind:layerConfig={layer} bind:colorPickerVisibleIndex />
      </div>
    {/if}
  </div>
  <div class="columm legend-toggle" transition:slide>
    <Wrapper>
      <div class="toggle-container" on:click={handleLegendToggleClick} data-testid="legend-toggle-container">
        <Card>
          <PrimaryAction style="padding: 10px;">
            <Fa icon={faRetweet} style="font-size: 16px;" spin={isLegendSwitchAnimate} />
          </PrimaryAction>
        </Card>
      </div>
      <Tooltip showDelay={1000} hideDelay={0} yPos="above">Toggle Legend Type</Tooltip>
    </Wrapper>
    <br />
    <Wrapper>
      <div class="toggle-container" use:popperRef on:click={handleClosePopup} data-testid="colormap-toggle-container">
        <Card>
          <PrimaryAction style="padding: 10px;">
            <Fa icon={faPalette} style="font-size: 16px;" />
          </PrimaryAction>
        </Card>
      </div>
      <Tooltip showDelay={1000} hideDelay={0} yPos="above">Change color map</Tooltip>
    </Wrapper>

    {#if showTooltip}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <ColorMapPicker
          on:handleColorMapClick={handleColorMapClick}
          on:handleClosePopup={handleClosePopup}
          {layer}
          layerMin={Number(layer.info['band_metadata'][bandIndex]['1']['STATISTICS_MINIMUM'])}
          layerMax={Number(layer.info['band_metadata'][bandIndex]['1']['STATISTICS_MAXIMUM'])} />
        <div id="arrow" data-popper-arrow />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import '../styles/popper.scss';

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
