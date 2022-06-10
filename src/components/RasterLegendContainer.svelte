<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { cloneDeep } from 'lodash-es'

  import ColorMapPicker from '$components/ColorMapPicker.svelte'
  import ContinuousLegend from '$components/ContinuousLegend.svelte'
  import IntervalsLegend from '$components/IntervalsLegend.svelte'
  import UniqueValuesLegend from '$components/UniqueValuesLegend.svelte'
  import { DynamicLayerLegendTypes } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { layerList } from '$stores'

  export let layer: Layer

  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
  let layerHasUniqueValues = false
  let layerListCount = $layerList.length
  let showTooltip = false

  // hide colormap picker if change in layer list
  $: {
    if (layerListCount !== $layerList.length) {
      showTooltip = false
      layerListCount = $layerList.length
    }
  }

  onMount(() => {
    layerHasUniqueValues = hasLayerUniqueValues()
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

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    if (layer.legendType === DynamicLayerLegendTypes.CONTINUOUS) {
      layer.legendType = layerHasUniqueValues ? DynamicLayerLegendTypes.UNIQUE : DynamicLayerLegendTypes.INTERVALS
    } else {
      layer.legendType = DynamicLayerLegendTypes.CONTINUOUS
    }
  }

  const hasLayerUniqueValues = () => {
    const stats = layer.info.band_metadata[0][1]
    const val = Object.prototype.hasOwnProperty.call(stats, 'STATISTICS_UNIQUE_VALUES')
    return val
  }

  const handleColorMapClick = (event: CustomEvent) => {
    if (event?.detail?.colorMapName) {
      const layerClone = cloneDeep(layer)
      layerClone.colorMapName = event.detail.colorMapName
      layer = layerClone
      colorPickerVisibleIndex = -1
    }
  }

  const handleClosePopup = () => {
    showTooltip = !showTooltip
    colorPickerVisibleIndex = -1
  }
</script>

<div class="columns" data-testid="raster-legend-view-container">
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
          layerMin={Number(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM'])}
          layerMax={Number(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])} />
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
