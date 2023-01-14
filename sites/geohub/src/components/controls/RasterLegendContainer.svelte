<script lang="ts">
  import { fade, slide } from 'svelte/transition'
  import ColorMapPicker from '$components/controls/ColorMapPicker.svelte'
  import RasterContinuousLegend from '$components/controls/RasterContinuousLegend.svelte'
  import RasterIntervalsLegend from '$components/controls/RasterIntervalsLegend.svelte'
  import RasterUniqueValuesLegend from '$components/controls/RasterUniqueValuesLegend.svelte'
  import { DynamicLayerLegendTypes, COLOR_CLASS_COUNT_MAXIMUM, ClassificationMethodTypes } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer, RasterTileMetadata, IntervalLegendColorMapRow } from '$lib/types'

  export let layer: Layer
  export let legendType: DynamicLayerLegendTypes = undefined
  export let classificationMethod: ClassificationMethodTypes
  export let colorMapName: string
  export let numberOfClasses: number
  export let colorMapRows: Array<IntervalLegendColorMapRow>

  let { info }: Layer = layer

  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
  let layerHasUniqueValues = false
  let showTooltip = false

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
      bandName = Object.keys((info as RasterTileMetadata).stats)
    } catch (e) {
      console.log(e)
    }
    layerHasUniqueValues =
      Number((info as RasterTileMetadata).stats[bandName]['unique']) <= COLOR_CLASS_COUNT_MAXIMUM &&
      !(info as RasterTileMetadata).dtype.startsWith('float')

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
          bind:classificationMethod
          bind:numberOfClasses
          bind:colorMapRows
          bind:generateCmap={showTooltip} />
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
  @import '../../styles/popper.scss';

  .legend-toggle {
    padding-top: 15px;
    max-height: 100px;

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
