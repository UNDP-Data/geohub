<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { createPopperActions } from 'svelte-popperjs'
  import { cloneDeep } from 'lodash-es'

  import ColorMapPicker from '$components/ColorMapPicker.svelte'
  import VectorSymbolSimple from '$components/controls/VectorSymbolSimple.svelte'
  import VectorSymbolAdvanced from '$components/controls/VectorSymbolAdvanced.svelte'
  import { VectorLayerSymbolLegendTypes, VectorLayerSymbolLegendApplyToTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { layerList } from '$stores'

  export let layer: Layer

  let applyToOption = layer?.intervals?.applyToOption
    ? layer.intervals.applyToOption
    : VectorLayerSymbolLegendApplyToTypes.ICON_COLOR
  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
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
    layer.legendType = layer.legendType ? layer.legendType : VectorLayerSymbolLegendTypes.SIMPLE
  })

  const handleLegendToggleClick = () => {
    colorPickerVisibleIndex = -1
    isLegendSwitchAnimate = true

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    if (layer.legendType === VectorLayerSymbolLegendTypes.SIMPLE) {
      layer.legendType = VectorLayerSymbolLegendTypes.ADVANCED
    } else {
      layer.legendType = VectorLayerSymbolLegendTypes.SIMPLE
    }
  }

  // const hasLayerUniqueValues = () => {
  //   const stats = layer.info.band_metadata[0][1]
  //   const val = Object.prototype.hasOwnProperty.call(stats, 'STATISTICS_UNIQUE_VALUES')
  //   return val
  // }

  const [popperRef, popperContent] = createPopperActions({
    placement: 'right-end',
    strategy: 'fixed',
  })

  const popperOptions = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [10, 25],
        },
      },
    ],
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
    {#if layer.legendType === VectorLayerSymbolLegendTypes.SIMPLE}
      <div transition:slide>
        <VectorSymbolSimple bind:layer />
      </div>
    {:else if layer.legendType === VectorLayerSymbolLegendTypes.ADVANCED}
      <div transition:slide>
        <VectorSymbolAdvanced bind:layer bind:applyToOption />
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

    {#if layer.legendType === VectorLayerSymbolLegendTypes.ADVANCED && applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR}
      <div
        class="toggle-container"
        use:popperRef
        on:click={handleClosePopup}
        data-testid="colormap-toggle-container"
        transition:fade>
        <Card>
          <PrimaryAction style="padding: 10px;">
            <Fa icon={faPalette} style="font-size: 16px;" />
          </PrimaryAction>
        </Card>
      </div>
    {/if}

    {#if showTooltip}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <ColorMapPicker on:handleColorMapClick={handleColorMapClick} on:handleClosePopup={handleClosePopup} {layer} />
        <div id="arrow" data-popper-arrow />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .legend-toggle {
    padding-top: 15px;

    .toggle-container {
      margin-left: 3.5px;
    }
  }

  $tooltip-background: #fff;

  #tooltip {
    background: $tooltip-background;
    border-radius: 7.5px;
    border: 1px solid #ccc;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    font-size: 13px;
    inset: auto auto 0px -10px !important;
    max-height: 300px;
    max-width: 470px;
    padding-top: 10px;
    padding: 15px;
    position: absolute;
    top: 10px;
    width: 470px;

    @media (prefers-color-scheme: dark) {
      background: #212125;
    }

    #arrow,
    #arrow::before {
      background: $tooltip-background;
      height: 18px;
      left: -4.5px;
      position: absolute;
      width: 18px;

      @media (prefers-color-scheme: dark) {
        background: #212125;
      }
    }

    #arrow {
      visibility: visible;
    }

    #arrow::before {
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
      content: '';
      transform: rotate(45deg);
      visibility: visible;
    }
  }
</style>
