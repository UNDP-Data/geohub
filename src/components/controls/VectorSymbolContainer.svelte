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
  import VectorSymbolSimple from '$components/controls/VectorSymbolSimple.svelte'
  import VectorSymbolAdvanced from '$components/controls/VectorSymbolAdvanced.svelte'
  import {
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    DEFAULT_COLORMAP,
    VectorLayerSymbolLegendTypes,
    VectorLayerSymbolLegendApplyToTypes,
  } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { layerList } from '$stores'

  export let layer: Layer

  let applyToOption = layer?.intervals?.applyToOption
    ? layer.intervals.applyToOption
    : VectorLayerSymbolLegendApplyToTypes.ICON_COLOR
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

  onMount(() => {
    layer.legendType = layer.legendType ? layer.legendType : VectorLayerSymbolLegendTypes.SIMPLE
    layer.colorMapName = layer.colorMapName ? layer.colorMapName : DEFAULT_COLORMAP

    if (layer?.intervals === undefined) {
      layer.intervals = {
        classification: ClassificationMethodTypes.NATURAL_BREAK,
        numberOfClasses: COLOR_CLASS_COUNT,
        colorMapRows: [],
        propertyName: '',
        applyToOption: VectorLayerSymbolLegendApplyToTypes.ICON_COLOR,
      }
    }
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

<div class="columns" data-testid="symbol-view-container">
  <div class="column is-10">
    {#if layer.legendType === VectorLayerSymbolLegendTypes.SIMPLE}
      <div transition:slide>
        <VectorSymbolSimple bind:layer />
      </div>
    {:else if layer.legendType === VectorLayerSymbolLegendTypes.ADVANCED}
      <div transition:slide>
        <VectorSymbolAdvanced bind:layer bind:applyToOption bind:layerMin bind:layerMax />
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

    {#if showTooltip && layer.legendType === VectorLayerSymbolLegendTypes.ADVANCED && applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
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
  @import '../../styles/popper.scss';

  .legend-toggle {
    padding-top: 15px;

    .toggle-container {
      margin-left: 3.5px;
    }
  }

  $tooltip-background: #fff;

  #tooltip {
    max-width: 470px;
    width: 470px;
  }
</style>
