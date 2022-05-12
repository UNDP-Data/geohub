<script lang="ts">
  import FillColor from '$components/controls/vector-styles/FillColor.svelte'
  import FillOutlineColor from '$components/controls/vector-styles/FillOutlineColor.svelte'
  import HeatmapColor from '$components/controls/vector-styles/HeatmapColor.svelte'
  import HeatmapIntensity from '$components/controls/vector-styles/HeatmapIntensity.svelte'
  import HeatmapRadius from '$components/controls/vector-styles/HeatmapRadius.svelte'
  import HeatmapWeight from '$components/controls/vector-styles/HeatmapWeight.svelte'
  import IconColor from '$components/controls/vector-styles/IconColor.svelte'
  import IconIgnorePlacement from '$components/controls/vector-styles/IconIgnorePlacement.svelte'
  import IconImage from '$components/controls/vector-styles/IconImage.svelte'
  import IconOffset from '$components/controls/vector-styles/IconOffset.svelte'
  import IconOverlap from '$components/controls/vector-styles/IconOverlap.svelte'
  import IconSize from '$components/controls/vector-styles/IconSize.svelte'
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
  <div class="action">
    {#if style.type === LayerTypes.LINE}
      <LineWidth {layer} />
      <LineBlur {layer} />
      <LineColor {layer} />
      <LineDasharray {layer} />
      <LineJoin {layer} />
    {:else if style.type === LayerTypes.FILL}
      <FillColor {layer} />
      <FillOutlineColor {layer} />
    {:else if style.type === LayerTypes.SYMBOL}
      <div class="columns is-flex is-vcentered">
        <div class="column is-2">
          <div class="is-size-6">Icon</div>
        </div>
        <div class="column">
          <div>
            <IconImage {layer} />
          </div>
        </div>
        <div class="column">
          <div class="is-size-6">Size</div>
        </div>
        <div class="column is-5">
          <div>
            <IconSize {layer} />
          </div>
        </div>
      </div>
      <div class="columns is-flex is-vcentered">
        <div class="column is-2">
          <div class="is-size-6">Color</div>
        </div>
        <div class="column">
          <div>
            <IconColor {layer} />
          </div>
        </div>
        <div class="column">
          <div class="is-size-6">Overlap</div>
        </div>
        <div class="column is-5">
          <div>
            <IconOverlap {layer} />
          </div>
        </div>
      </div>
      <IconOffset {layer} />
      <div class="columns is-flex is-vcentered">
        <div class="column is-3">
          <div class="is-size-6">Ignore placement</div>
        </div>
        <div class="column">
          <div>
            <IconIgnorePlacement {layer} />
          </div>
        </div>
      </div>
    {:else if style.type === LayerTypes.HEATMAP}
      <HeatmapColor {layer} />
      <HeatmapIntensity {layer} />
      <HeatmapRadius {layer} />
      <HeatmapWeight {layer} />
    {/if}
  </div>
{/if}

<style lang="scss">
  .action {
    margin-bottom: 25px;
  }
</style>
