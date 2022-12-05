<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { cloneDeep } from 'lodash-es'

  import ColorMapPicker from '$components/controls/ColorMapPicker.svelte'
  import VectorPolygonSimple from '$components/controls/VectorPolygonSimple.svelte'
  import VectorPolygonAdvanced from '$components/controls/VectorPolygonAdvanced.svelte'
  import { ClassificationMethodTypes, VectorLayerPolygonLegendTypes } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'
  import { getLayerProperties } from '$lib/helper'
  import chroma from 'chroma-js'

  export let layer: Layer
  export let colorMapName
  export let classificationMethod: ClassificationMethodTypes = ClassificationMethodTypes.NATURAL_BREAK
  export let legendType: string

  const getFillColor = (): string => {
    let fillColor = $map.getPaintProperty(layer.id, 'fill-color')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!fillColor || (fillColor && fillColor.type === 'interval')) {
      fillColor = chroma.random().hex()
    }
    return fillColor as string
  }

  export let defaultFillColor = getFillColor()

  const getFillOutlineColor = (): string => {
    let fillOutlineColor = $map.getPaintProperty(layer.id, 'fill-outline-color')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!fillOutlineColor || (fillOutlineColor && fillOutlineColor.type === 'interval')) {
      fillOutlineColor = chroma(defaultFillColor).darken(2.5).hex()
    }
    return fillOutlineColor as string
  }

  export let defaultFillOutlineColor = getFillOutlineColor()

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
    legendType = legendType ? legendType : VectorLayerPolygonLegendTypes.SIMPLE
    layerNumberProperties = getLayerNumberPropertiesCount()
  })

  const handleLegendToggleClick = () => {
    colorPickerVisibleIndex = -1
    isLegendSwitchAnimate = true

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    if (legendType === VectorLayerPolygonLegendTypes.SIMPLE) {
      legendType = VectorLayerPolygonLegendTypes.ADVANCED
    } else {
      legendType = VectorLayerPolygonLegendTypes.SIMPLE
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
  data-testid="polygon-view-container">
  <div class={`column ${layerNumberProperties > 0 ? 'is-10' : 'is-12'}`}>
    {#if legendType === VectorLayerPolygonLegendTypes.SIMPLE}
      <div transition:slide>
        <VectorPolygonSimple
          bind:layer
          bind:defaultFillColor
          bind:defaultFillOutlineColor />
      </div>
    {:else if legendType === VectorLayerPolygonLegendTypes.ADVANCED}
      <div transition:slide>
        <VectorPolygonAdvanced
          bind:layer
          bind:layerMin
          bind:layerMax
          bind:colorMapName
          bind:classificationMethod
          bind:numberOfClasses
          bind:defaultFillOutlineColor />
      </div>
    {/if}
  </div>
  <div
    class="columm legend-toggle"
    transition:slide>
    {#if layerNumberProperties > 0}
      <div
        role="button"
        class="toggle-container has-tooltip-left icon m-1"
        aria-label="Switch legend type button"
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

    {#if legendType === VectorLayerPolygonLegendTypes.ADVANCED}
      <div
        role="button"
        class="toggle-container icon m-1"
        aria-label="Open color scheme picker"
        use:popperRef
        on:click={handleClosePopup}
        on:keydown={handleEnterKey}
        data-testid="colormap-toggle-container"
        tabindex="0"
        transition:fade>
        <Fa
          icon={faPalette}
          style="font-size: 16px; color:white" />
      </div>
    {/if}

    {#if showTooltip && legendType === VectorLayerPolygonLegendTypes.ADVANCED}
      <div
        id="tooltip"
        data-testid="tooltip"
        use:popperContent={popperOptions}
        transition:fade>
        <ColorMapPicker
          on:handleClosePopup={handleClosePopup}
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

  $tooltip-background: #fff;

  #tooltip {
    max-width: 470px;
    width: 470px;
  }
</style>
