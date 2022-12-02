<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { cloneDeep } from 'lodash-es'

  import ColorMapPicker from '$components/controls/ColorMapPicker.svelte'
  import VectorLineSimple from '$components/controls/VectorLineSimple.svelte'
  import VectorLineAdvanced from '$components/controls/VectorLineAdvanced.svelte'
  import {
    ClassificationMethodTypes,
    VectorLayerLineLegendTypes,
    VectorLayerLineLegendApplyToTypes,
  } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'
  import { getLayerProperties } from '$lib/helper'
  import chroma from 'chroma-js'

  export let layer: Layer
  export let colorMapName
  export let classificationMethod: ClassificationMethodTypes = ClassificationMethodTypes.NATURAL_BREAK
  export let applyToOption: string = VectorLayerLineLegendApplyToTypes.LINE_COLOR
  export let legendType: string

  const getLineColor = (): string => {
    let lineColor = $map.getPaintProperty(layer.id, 'line-color')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!lineColor || (lineColor && lineColor.type === 'interval')) {
      lineColor = chroma.random().hex()
    }
    return lineColor as string
  }

  export let defaultColor = getLineColor()

  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
  let layerListCount = $layerList.length
  let layerMin: number
  let layerMax: number
  let showTooltip = false
  let layerNumberProperties = 0
  let numberOfClasses: number

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
    legendType = legendType ? legendType : VectorLayerLineLegendTypes.SIMPLE
    layerNumberProperties = getLayerNumberPropertiesCount()
  })

  const handleLegendToggleClick = () => {
    colorPickerVisibleIndex = -1
    isLegendSwitchAnimate = true

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    if (legendType === VectorLayerLineLegendTypes.SIMPLE) {
      legendType = VectorLayerLineLegendTypes.ADVANCED
    } else {
      legendType = VectorLayerLineLegendTypes.SIMPLE
    }
  }

  $: colorMapName, colorMapChanged()
  const colorMapChanged = () => {
    const layerClone = cloneDeep(layer)
    layer = layerClone
    colorPickerVisibleIndex = -1
  }

  const handleClosePopup = () => {
    showTooltip = !showTooltip
    colorPickerVisibleIndex = -1
  }

  const getLayerNumberPropertiesCount = () => {
    const vectorLayerMeta = getLayerProperties($map, layer)
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
    {#if legendType === VectorLayerLineLegendTypes.SIMPLE}
      <div transition:slide>
        <VectorLineSimple
          bind:layer
          bind:defaultColor />
      </div>
    {:else if legendType === VectorLayerLineLegendTypes.ADVANCED}
      <div transition:slide>
        <VectorLineAdvanced
          bind:layer
          bind:applyToOption
          bind:layerMin
          bind:layerMax
          bind:colorMapName
          bind:classificationMethod
          bind:numberOfClasses
          bind:defaultColor />
      </div>
    {/if}
  </div>
  <div
    class="columm legend-toggle"
    transition:slide>
    {#if layerNumberProperties > 0}
      <div
        role="button"
        aria-label="Switch legend type"
        class="toggle-container has-tooltip-left icon m-1"
        data-tooltip="Toggle Legend Type"
        tabindex="0"
        on:click={handleLegendToggleClick}
        on:keydown={handleEnterKey}
        data-testid="legend-toggle-container">
        <Fa
          icon={faRetweet}
          style="font-size: 16px; color:white"
          spin={isLegendSwitchAnimate} />
      </div>
      <br />
    {/if}

    {#if legendType === VectorLayerLineLegendTypes.ADVANCED && applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR}
      <div
        class="toggle-container icon m-1"
        role="button"
        aria-label="Open color scheme picker"
        tabindex="0"
        use:popperRef
        on:click={handleClosePopup}
        on:keydown={handleEnterKey}
        data-testid="colormap-toggle-container"
        transition:fade>
        <Fa
          icon={faPalette}
          style="font-size: 16px; color:white" />
      </div>
    {/if}

    {#if showTooltip && legendType === VectorLayerLineLegendTypes.ADVANCED && applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR}
      <div
        id="tooltip"
        data-testid="tooltip"
        use:popperContent={popperOptions}
        transition:fade>
        <ColorMapPicker
          on:handleClosePopup={handleClosePopup}
          {layer}
          {layerMin}
          {layerMax}
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
    max-width: 470px;
    width: 470px;
  }
</style>
