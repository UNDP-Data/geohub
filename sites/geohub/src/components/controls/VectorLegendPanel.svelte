<script lang="ts">
  import type { LayerSpecification } from 'maplibre-gl'

  import VectorSymbolContainer from '$components/controls/VectorSymbolContainer.svelte'
  import VectorLineContainer from '$components/controls/VectorLineContainer.svelte'
  import VectorPolygonContainer from '$components/controls/VectorPolygonContainer.svelte'
  import HeatmapColor from '$components/controls/vector-styles/HeatmapColor.svelte'
  import HeatmapIntensity from '$components/controls/vector-styles/HeatmapIntensity.svelte'
  import HeatmapRadius from '$components/controls/vector-styles/HeatmapRadius.svelte'
  import HeatmapWeight from '$components/controls/vector-styles/HeatmapWeight.svelte'
  import { ClassificationMethodTypes, LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let isLegendPanelVisible = false
  export let layer: Layer = LayerInitialValues
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
      <div class="columns">
        <div class="column">
          <div class="has-text-centered pb-2">Heatmap Color</div>
          <div>
            <HeatmapColor {layer} />
          </div>
        </div>
        <div class="column">
          <div class="columns">
            <div class="column pb-0">
              <div class="has-text-centered pb-2">Heatmap Intensity</div>
              <div class="is-flex is-justify-content-center">
                <HeatmapIntensity {layer} />
              </div>
            </div>
          </div>
          <div class="columns">
            <div class="column pb-0">
              <div class="has-text-centered pb-2">Heatmap Radius</div>
              <div class="is-flex is-justify-content-center">
                <HeatmapRadius {layer} />
              </div>
            </div>
          </div>
          <div class="columns">
            <div class="column pb-0">
              <div class="has-text-centered pb-2">Heatmap Weight</div>
              <div class="is-flex is-justify-content-center">
                <HeatmapWeight {layer} />
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
{/if}
