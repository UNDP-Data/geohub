<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { cloneDeep } from 'lodash-es'

  import ColorMapPicker from '$components/controls/ColorMapPicker.svelte'
  import VectorLineSimple from '$components/controls/VectorLineSimple.svelte'
  import VectorLineAdvanced from '$components/controls/VectorLineAdvanced.svelte'
  import {
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    DEFAULT_COLORMAP,
    VectorLayerLineLegendTypes,
    VectorLayerLineLegendApplyToTypes,
  } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'
  import { getLayerNumberProperties } from '$lib/helper'

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
  let layerNumberProperties = 0

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

    layerNumberProperties = getLayerNumberPropertiesCount()
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

  const getLayerNumberPropertiesCount = () => {
    const vectorLayerMeta = getLayerNumberProperties($map, layer)
    return Object.keys(vectorLayerMeta.fields).length
  }

  const handleEnterKey = (event: any) => {
    if (event.key === 'Enter') {
      event.target.click()
    }
  }
</script>

<div
  class="columns"
  data-testid="line-view-container">
  <div class={`column ${layerNumberProperties > 0 ? 'is-10' : 'is-12'}`}>
    {#if layer.legendType === VectorLayerLineLegendTypes.SIMPLE}
      <div transition:slide>
        <VectorLineSimple bind:layer />
      </div>
    {:else if layer.legendType === VectorLayerLineLegendTypes.ADVANCED}
      <div transition:slide>
        <VectorLineAdvanced
          bind:layer
          bind:applyToOption
          bind:layerMin
          bind:layerMax />
      </div>
    {/if}
  </div>
  <div
    class="columm legend-toggle"
    transition:slide>
    {#if layerNumberProperties > 0}
      <Wrapper>
        <div
          role="button"
          aria-label="Switch legend type"
          class="toggle-container"
          on:click={handleLegendToggleClick}
          on:keydown={handleEnterKey}
          data-testid="legend-toggle-container">
          <Card style="background: #D12800;">
            <PrimaryAction style="padding: 10px;">
              <Fa
                icon={faRetweet}
                style="font-size: 16px; color:white"
                spin={isLegendSwitchAnimate} />
            </PrimaryAction>
          </Card>
        </div>
        <Tooltip
          showDelay={500}
          hideDelay={0}
          yPos="above">Toggle Legend Type</Tooltip>
      </Wrapper>
      <br />
    {/if}

    {#if layer.legendType === VectorLayerLineLegendTypes.ADVANCED && applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR}
      <div
        class="toggle-container"
        role="button"
        aria-label="Open color scheme picker"
        use:popperRef
        on:click={handleClosePopup}
        on:keydown={handleEnterKey}
        data-testid="colormap-toggle-container"
        transition:fade>
        <Card style="background: #D12800;">
          <PrimaryAction style="padding: 10px;">
            <Fa
              icon={faPalette}
              style="font-size: 16px; color:white" />
          </PrimaryAction>
        </Card>
      </div>
    {/if}

    {#if showTooltip && layer.legendType === VectorLayerLineLegendTypes.ADVANCED && applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR}
      <div
        id="tooltip"
        data-testid="tooltip"
        use:popperContent={popperOptions}
        transition:fade>
        <ColorMapPicker
          on:handleColorMapClick={handleColorMapClick}
          on:handleClosePopup={handleClosePopup}
          {layer}
          {layerMin}
          {layerMax} />
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

    .toggle-container {
      margin-left: 3.5px;
    }
  }

  #tooltip {
    max-width: 470px;
    width: 470px;
  }
</style>
