<script lang="ts">
  import type { LayerSpecification } from 'maplibre-gl'
  import VectorSymbolContainer from '$components/controls/VectorSymbolContainer.svelte'
  import VectorLineContainer from '$components/controls/VectorLineContainer.svelte'
  import VectorPolygonContainer from '$components/controls/VectorPolygonContainer.svelte'
  import VectorHeatmapContainer from './VectorHeatmapContainer.svelte'
  import { ClassificationMethodTypes, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let isLegendPanelVisible = false
  export let layer: Layer
  export let colorMapName: string
  export let classificationMethod: ClassificationMethodTypes
  export let applyToOption: string
  export let legendType: string
  export let defaultColor: string = undefined
  export let defaultLineColor: string = undefined

  const layerId = layer.id
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
</script>

{#if isLegendPanelVisible === true}
  <div
    class="vector-legend-panel-container"
    data-testid="vector-legend-panel-container">
    {#if style.type === LayerTypes.LINE}
      <VectorLineContainer
        bind:layer
        bind:colorMapName
        bind:classificationMethod
        bind:applyToOption
        bind:legendType
        bind:defaultColor={defaultLineColor} />
    {:else if style.type === LayerTypes.FILL}
      <VectorPolygonContainer
        bind:layer
        bind:colorMapName
        bind:classificationMethod
        bind:legendType
        bind:defaultFillColor={defaultColor}
        bind:defaultFillOutlineColor={defaultLineColor} />
    {:else if style.type === LayerTypes.SYMBOL}
      <VectorSymbolContainer
        bind:layer
        bind:colorMapName
        bind:classificationMethod
        bind:applyToOption
        bind:legendType
        bind:defaultColor />
    {:else if style.type === LayerTypes.HEATMAP}
      <VectorHeatmapContainer bind:layer />
    {/if}
  </div>
{/if}
