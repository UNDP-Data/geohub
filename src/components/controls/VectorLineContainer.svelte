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
  import { clickOutside } from 'svelte-use-click-outside'

  import ColorMapPicker from '$components/ColorMapPicker.svelte'
  import VectorLineSimple from '$components/controls/VectorLineSimple.svelte'
  import VectorLineAdvanced from '$components/controls/VectorLineAdvanced.svelte'
  import {
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    DEFAULT_COLORMAP,
    VectorLayerLineLegendTypes,
    VectorLayerLineLegendApplyToTypes,
  } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { layerList } from '$stores'

  export let layer: Layer

  let applyToOption = layer?.intervals?.applyToOption
    ? layer.intervals.applyToOption
    : VectorLayerLineLegendApplyToTypes.LINE_COLOR
  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
  let layerListCount = $layerList.length
  let layerMin: number
  let layerMax: number
  let showTooltip = false

  // hide colormap picker if change in layer list
  $: {
    if (layerListCount !== $layerList.length) {
      showTooltip = false
      layerListCount = $layerList.length
    }
  }

  onMount(() => {
    // set default values
    layer.legendType = layer.legendType ? layer.legendType : VectorLayerLineLegendTypes.SIMPLE
    layer.colorMapName = layer.colorMapName ? layer.colorMapName : DEFAULT_COLORMAP

    if (layer?.intervals === undefined) {
      layer.intervals = {
        classification: ClassificationMethodTypes.NATURAL_BREAK,
        numberOfClasses: COLOR_CLASS_COUNT,
        colorMapRows: [],
        propertyName: '',
        applyToOption: VectorLayerLineLegendApplyToTypes.LINE_COLOR,
      }
    }
  })

  const handleLegendToggleClick = () => {
    colorPickerVisibleIndex = -1
    isLegendSwitchAnimate = true

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    if (layer.legendType === VectorLayerLineLegendTypes.SIMPLE) {
      layer.legendType = VectorLayerLineLegendTypes.ADVANCED
    } else {
      layer.legendType = VectorLayerLineLegendTypes.SIMPLE
    }
  }

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

<div class="columns" data-testid="vector-line-view-container">
  <div class="column is-10">
    {#if layer.legendType === VectorLayerLineLegendTypes.SIMPLE}
      <div transition:slide>
        <VectorLineSimple bind:layer />
      </div>
    {:else if layer.legendType === VectorLayerLineLegendTypes.ADVANCED}
      <div transition:slide>
        <VectorLineAdvanced bind:layer bind:applyToOption bind:layerMin bind:layerMax />
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
      <Tooltip showDelay={500} hideDelay={0} yPos="above">Toggle Legend Type</Tooltip>
    </Wrapper>
    <br />

    {#if layer.legendType === VectorLayerLineLegendTypes.ADVANCED && applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR}
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

    {#if showTooltip && layer.legendType === VectorLayerLineLegendTypes.ADVANCED && applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR}
      <div
        id="tooltip"
        data-testid="tooltip"
        use:popperContent={popperOptions}
        use:clickOutside={handleClosePopup}
        transition:fade>
        <ColorMapPicker
          on:handleColorMapClick={handleColorMapClick}
          on:handleClosePopup={handleClosePopup}
          {layer}
          {layerMin}
          {layerMax} />
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
