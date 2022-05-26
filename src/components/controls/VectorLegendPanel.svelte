<script lang="ts">
  import VectorSymbolContainer from '$components/controls/VectorSymbolContainer.svelte'
  import FillColor from '$components/controls/vector-styles/FillColor.svelte'
  import FillOutlineColor from '$components/controls/vector-styles/FillOutlineColor.svelte'
  import HeatmapColor from '$components/controls/vector-styles/HeatmapColor.svelte'
  import HeatmapIntensity from '$components/controls/vector-styles/HeatmapIntensity.svelte'
  import HeatmapRadius from '$components/controls/vector-styles/HeatmapRadius.svelte'
  import HeatmapWeight from '$components/controls/vector-styles/HeatmapWeight.svelte'
  import LineBlur from '$components/controls/vector-styles/LineBlur.svelte'
  import LineColor from '$components/controls/vector-styles/LineColor.svelte'
  import LineDasharray from '$components/controls/vector-styles/LineDasharray.svelte'
  import LineJoin from '$components/controls/vector-styles/LineJoin.svelte'
  import LineWidth from '$components/controls/vector-styles/LineWidth.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { map } from '$stores'

  export let isLegendPanelVisible = false
  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const style: LayerSpecification = $map
    .getStyle()
    .layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
</script>

{#if isLegendPanelVisible === true}
  <div class="vector-legend-panel-container" data-testid="vector-legend-panel-container">
    {#if style.type === LayerTypes.LINE}
      <div class="columns first-row">
        <div class="column line-color">
          <div class="is-flex is-justify-content-center">Line Color</div>
          <div class="is-flex is-justify-content-center" style="z-index: 10; position: relative;">
            <LineColor {layer} />
          </div>
        </div>
      </div>
      <div class="columns first-row">
        <div class="column line-width">
          <div class="is-flex is-justify-content-center">Line Width</div>
          <div class="is-flex is-justify-content-center">
            <LineWidth {layer} />
          </div>
        </div>
        <div class="column line-blur">
          <div class="is-flex is-justify-content-center">Line Blur</div>
          <div class="is-flex is-justify-content-center">
            <LineBlur {layer} />
          </div>
        </div>
      </div>
      <div class="columns first-row">
        <div class="column line-dash">
          <div class="is-flex is-justify-content-center">Line Dash</div>
          <div class="is-flex is-justify-content-center">
            <LineDasharray {layer} />
          </div>
        </div>
        <div class="column line-join">
          <div class="is-flex is-justify-content-center">Line Join</div>
          <div class="is-flex is-justify-content-center">
            <LineJoin {layer} />
          </div>
        </div>
      </div>
    {:else if style.type === LayerTypes.FILL}
      <div class="columns first-row">
        <div class="column fill-color" style="padding-left: 50px;">
          <div class="is-flex is-justify-content-center">Fill Color</div>
          <div class="is-flex is-justify-content-center" style="z-index: 10; position: relative;">
            <FillColor {layer} />
          </div>
        </div>
        <div class="column fill-outline-color" style="padding-right: 50px;">
          <div class="is-flex is-justify-content-center">Fill Outline Color</div>
          <div class="is-flex is-justify-content-center" style="z-index: 1; position: relative;">
            <FillOutlineColor {layer} />
          </div>
        </div>
      </div>
    {:else if style.type === LayerTypes.SYMBOL}
      <VectorSymbolContainer bind:layer />
    {:else if style.type === LayerTypes.HEATMAP}
      <div class="columns first-row">
        <div class="column heat-map-color">
          <div class="is-flex is-justify-content-center">Heatmap Color</div>
          <div>
            <HeatmapColor {layer} />
          </div>
        </div>
        <div class="column">
          <div class="columns first-row">
            <div class="column" style="padding-bottom: 3px;">
              <div class="is-flex is-justify-content-center">Heatmap Intensity</div>
              <div class="is-flex is-justify-content-center">
                <HeatmapIntensity {layer} />
              </div>
            </div>
          </div>
          <div class="columns first-row">
            <div class="column" style="padding-bottom: 3px;">
              <div class="is-flex is-justify-content-center">Heatmap Radius</div>
              <div class="is-flex is-justify-content-center">
                <HeatmapRadius {layer} />
              </div>
            </div>
          </div>
          <div class="columns first-row">
            <div class="column" style="padding-bottom: 3px;">
              <div class="is-flex is-justify-content-center">Heatmap Weight</div>
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

<style lang="scss">
  @import '../../styles/bulma-switch.min.css';
  @import '../../styles/bulma-divider.min.css';

  .vector-legend-panel-container {
    margin-bottom: 15px;

    .first-row {
      margin-bottom: 0;

      .heat-map-color,
      .line-color,
      .line-dash,
      .line-join,
      .icon-image,
      .fill-color,
      .fill-outline-color {
        div:first-child {
          margin-bottom: 10px;
        }

        div:second-child {
          height: 30px;
        }
      }
    }
  }
</style>
