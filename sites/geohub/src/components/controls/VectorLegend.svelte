<script lang="ts">
  import { slide } from 'svelte/transition'
  import type { LayerSpecification } from 'maplibre-gl'
  import VectorLine from './VectorLine.svelte'
  import VectorPolygon from './VectorPolygon.svelte'
  import VectorSymbol from './VectorSymbol.svelte'
  import VectorHeatmap from './VectorHeatmap.svelte'
  import VectorLegendAdvanced from './VectorLegendAdvanced.svelte'
  import { ClassificationMethodTypes, LayerTypes, VectorApplyToTypes, VectorLegendTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import chroma from 'chroma-js'
  import LegendTypeSwitcher from './LegendTypeSwitcher.svelte'

  export let layer: Layer
  export let colorMapName: string
  export let classificationMethod: ClassificationMethodTypes = ClassificationMethodTypes.NATURAL_BREAK
  export let applyToOption: VectorApplyToTypes
  export let legendType: 'simple' | 'advanced'

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
      legendType = VectorLegendTypes.ADVANCED
      applyToOption = VectorApplyToTypes.COLOR
    } else if (isIntervalExpression('line-width')) {
      legendType = VectorLegendTypes.ADVANCED
      applyToOption = VectorApplyToTypes.SIZE
    }
  } else if (style.type === 'symbol') {
    if (isIntervalExpression('icon-color')) {
      legendType = VectorLegendTypes.ADVANCED
      applyToOption = VectorApplyToTypes.COLOR
    } else if (isIntervalExpression('icon-size')) {
      legendType = VectorLegendTypes.ADVANCED
      applyToOption = VectorApplyToTypes.SIZE
    }
  } else if (style.type === 'fill') {
    if (isIntervalExpression('fill-color')) {
      legendType = VectorLegendTypes.ADVANCED
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
  legendType = legendType ? legendType : VectorLegendTypes.SIMPLE
</script>

{#if style.type !== LayerTypes.HEATMAP}
  <LegendTypeSwitcher bind:legendType />
{/if}

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
      bind:colorMapName
      bind:classificationMethod
      bind:defaultColor
      bind:applyToOption />
  </div>
{/if}
