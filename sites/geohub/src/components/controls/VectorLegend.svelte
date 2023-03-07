<script lang="ts">
  import { slide } from 'svelte/transition'
  import type { LayerSpecification } from 'maplibre-gl'
  import VectorLine from './VectorLine.svelte'
  import VectorPolygon from './VectorPolygon.svelte'
  import VectorSymbol from './VectorSymbol.svelte'
  import VectorHeatmap from './VectorHeatmap.svelte'
  import VectorLegendAdvanced from './VectorClassifyLegend.svelte'
  import { LegendTypes, VectorApplyToTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import chroma from 'chroma-js'
  import LegendTypeSwitcher from './LegendTypeSwitcher.svelte'
  import { Loader } from '@undp-data/svelte-undp-design'
  import { loadMap } from '$lib/helper'

  export let layer: Layer
  export let applyToOption: VectorApplyToTypes
  export let legendType: LegendTypes

  const layerId = layer.id
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  const isIntervalExpression = (property: 'line-color' | 'line-width' | 'icon-color' | 'icon-size' | 'fill-color') => {
    const layoutProperties = ['icon-size']
    const expr = layoutProperties.includes(property)
      ? $map.getLayoutProperty(layer.id, property)
      : $map.getPaintProperty(layer.id, property)
    return expr?.type === 'interval' || expr?.type === 'categorical'
  }

  if (style.type === 'line') {
    if (isIntervalExpression('line-color')) {
      legendType = LegendTypes.CLASSIFY
      applyToOption = VectorApplyToTypes.COLOR
    } else if (isIntervalExpression('line-width')) {
      legendType = LegendTypes.CLASSIFY
      applyToOption = VectorApplyToTypes.SIZE
    }
  } else if (style.type === 'symbol') {
    if (isIntervalExpression('icon-color')) {
      legendType = LegendTypes.CLASSIFY
      applyToOption = VectorApplyToTypes.COLOR
    } else if (isIntervalExpression('icon-size')) {
      legendType = LegendTypes.CLASSIFY
      applyToOption = VectorApplyToTypes.SIZE
    }
  } else if (style.type === 'fill') {
    if (isIntervalExpression('fill-color')) {
      legendType = LegendTypes.CLASSIFY
    }
  }

  const getDefaultColor = (property: 'icon-color' | 'fill-color' | 'fill-outline-color' | 'line-color'): string => {
    let color = $map.getPaintProperty(layer.id, property)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!color || (color && (color.type === 'interval' || (color && color.type === 'categorical')))) {
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

  // set default values
  legendType = legendType ? legendType : LegendTypes.DEFAULT

  const vectorLayerLoaded = async () => {
    return await loadMap($map)
  }
</script>

{#if style.type !== 'heatmap'}
  <LegendTypeSwitcher bind:legendType />
{/if}
{#await vectorLayerLoaded()}
  <div class="loader-container p-3">
    <Loader size="small" />
  </div>
{:then vectorLayerAvailable}
  {#if style.type === 'heatmap'}
    <VectorHeatmap bind:layer />
  {:else if legendType === LegendTypes.DEFAULT}
    <div transition:slide>
      {#if style.type === 'line'}
        <VectorLine
          bind:layer
          bind:defaultColor={defaultLineColor} />
      {:else if style.type === 'fill'}
        <VectorPolygon
          bind:layer
          bind:defaultFillColor={defaultColor}
          bind:defaultFillOutlineColor={defaultLineColor} />
      {:else if style.type === 'symbol'}
        <VectorSymbol
          bind:layer
          bind:defaultColor />
      {/if}
    </div>
  {:else if legendType === LegendTypes.CLASSIFY}
    <div transition:slide>
      <VectorLegendAdvanced
        bind:layer
        bind:defaultColor
        bind:applyToOption />
    </div>
  {/if}
{/await}

<style lang="scss">
  .loader-container {
    display: flex;
    align-items: center;
    width: fit-content;
    margin: 0 auto;
  }
</style>
