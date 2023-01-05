<script lang="ts">
  import { fade, slide } from 'svelte/transition'
  import { cloneDeep } from 'lodash-es'
  import type { LayerSpecification } from 'maplibre-gl'
  import VectorLine from './VectorLine.svelte'
  import VectorPolygon from './VectorPolygon.svelte'
  import VectorSymbol from './VectorSymbol.svelte'
  import VectorHeatmap from './VectorHeatmap.svelte'
  import VectorLegendAdvanced from '$components/controls/VectorLegendAdvanced.svelte'
  import { ClassificationMethodTypes, LayerTypes, VectorApplyToTypes, VectorLegendTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'
  import ColorMapPicker from './ColorMapPicker.svelte'
  import Popper from '$lib/popper'
  import { getLayerProperties } from '$lib/helper'
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'

  export let isLegendPanelVisible = false
  export let layer: Layer
  export let colorMapName: string
  export let classificationMethod: ClassificationMethodTypes = ClassificationMethodTypes.NATURAL_BREAK
  export let applyToOption: VectorApplyToTypes = VectorApplyToTypes.COLOR
  export let legendType: string

  const layerId = layer.id
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  if (style.type === 'line') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if ($map.getPaintProperty(layer.id, 'line-color')?.type === 'interval') {
      legendType = VectorLegendTypes.ADVANCED
      applyToOption = VectorApplyToTypes.COLOR
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
    } else if ($map.getPaintProperty(layer.id, 'line-width')?.type === 'interval') {
      legendType = VectorLegendTypes.ADVANCED
      applyToOption = VectorApplyToTypes.SIZE
    }
  } else if (style.type === 'symbol') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if ($map.getPaintProperty(layer.id, 'icon-color')?.type === 'interval') {
      legendType = VectorLegendTypes.ADVANCED
      applyToOption = VectorApplyToTypes.COLOR
    } else if ($map.getLayoutProperty(layer.id, 'icon-size')?.type === 'interval') {
      legendType = VectorLegendTypes.ADVANCED
      applyToOption = VectorApplyToTypes.SIZE
    }
  } else if (style.type === 'fill') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if ($map.getPaintProperty(layer.id, 'fill-color')?.type === 'interval') {
      legendType = VectorLegendTypes.ADVANCED
    }
  }

  const getDefaultColor = (property: 'icon-color' | 'fill-color' | 'fill-outline-color' | 'line-color'): string => {
    let color = $map.getPaintProperty(layer.id, property)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!color || (color && color.type === 'interval')) {
      if (property === 'fill-outline-color') {
        color = chroma(defaultColor).darken(2.5).hex()
      } else {
        color = chroma.random().hex()
      }
    }
    return color as string
  }

  export let defaultColor: string =
    style.type === 'symbol'
      ? getDefaultColor('icon-color')
      : style.type === 'fill'
      ? getDefaultColor('fill-color')
      : style.type === 'line'
      ? getDefaultColor('line-color')
      : undefined

  export let defaultLineColor: string =
    style.type === 'line'
      ? getDefaultColor('line-color')
      : style.type === 'fill'
      ? getDefaultColor('fill-outline-color')
      : undefined

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

  onMount(() => {
    // set default values
    legendType = legendType ? legendType : VectorLegendTypes.SIMPLE
    layerNumberProperties = getLayerNumberPropertiesCount()
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

    if (legendType === VectorLegendTypes.SIMPLE) {
      legendType = VectorLegendTypes.ADVANCED
    } else {
      legendType = VectorLegendTypes.SIMPLE
    }
  }

  $: colorMapName, colorMapChanged()
  const colorMapChanged = () => {
    const layerClone = cloneDeep(layer)
    layer = layerClone
    colorPickerVisibleIndex = -1

    // fire event for style sharing
    $map?.fire('colormap:changed', {
      layerId: layer.id,
      colorMapName: colorMapName,
    })
  }

  const getLayerNumberPropertiesCount = () => {
    const vectorLayerMeta = getLayerProperties($map, layer)
    return Object.keys(vectorLayerMeta.fields).length
  }

  const handleClosePopup = () => {
    showTooltip = !showTooltip
    colorPickerVisibleIndex = -1
  }

  const handleEnterKey = (event: any) => {
    if (event.key === 'Enter') {
      event.target.click()
    }
  }
</script>

{#if isLegendPanelVisible === true}
  <div
    class="columns is-mobile"
    data-testid="line-view-container">
    <div class={`column ${style.type !== LayerTypes.HEATMAP && layerNumberProperties > 0 ? 'is-10' : 'is-12'}`}>
      {#if style.type === LayerTypes.HEATMAP}
        <VectorHeatmap bind:layer />
      {:else if legendType === VectorLegendTypes.SIMPLE}
        <div transition:slide>
          {#if style.type === LayerTypes.LINE}
            <VectorLine
              bind:layer
              bind:defaultColor={defaultLineColor} />
          {:else if style.type === LayerTypes.FILL}
            <VectorPolygon
              bind:layer
              bind:defaultFillColor={defaultColor}
              bind:defaultFillOutlineColor={defaultLineColor} />
          {:else if style.type === LayerTypes.SYMBOL}
            <VectorSymbol
              bind:layer
              bind:defaultColor />
          {/if}
        </div>
      {:else if legendType === VectorLegendTypes.ADVANCED}
        <div transition:slide>
          <VectorLegendAdvanced
            bind:layer
            bind:layerMin
            bind:layerMax
            bind:colorMapName
            bind:classificationMethod
            bind:numberOfClasses
            bind:defaultColor
            bind:defaultOutlineColor={defaultLineColor} />
        </div>
      {/if}
    </div>
    {#if style.type !== LayerTypes.HEATMAP}
      <div
        class="columm legend-toggle"
        transition:slide>
        {#if layerNumberProperties > 0}
          <div
            role="button"
            aria-label="Switch legend type"
            class="toggle-container has-tooltip-left has-tooltip-arrow icon m-1"
            data-tooltip="Toggle Legend Type"
            tabindex="0"
            on:click={handleLegendToggleClick}
            on:keydown={handleEnterKey}
            data-testid="legend-toggle-container">
            <i
              class="fa-solid fa-retweet {isLegendSwitchAnimate ? 'fa-spin' : ''}"
              style="font-size: 16px; color: white" />
          </div>
          <br />
        {/if}

        {#if legendType === VectorLegendTypes.ADVANCED && (applyToOption === VectorApplyToTypes.COLOR || style.type === LayerTypes.FILL)}
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
            <i
              class="fa-solid fa-palette"
              style="font-size: 16px; color: white" />
          </div>
        {/if}

        {#if showTooltip}
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
    {/if}
  </div>
{/if}

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
