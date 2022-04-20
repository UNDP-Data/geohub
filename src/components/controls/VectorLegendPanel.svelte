<script lang="ts">
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import VectorLegendSymbol from './VectorLegendSymbol.svelte'
  import LineWidth from './vector-styles/LineWidth.svelte'
  import LineBlur from './vector-styles/LineBlur.svelte'
  import LineColor from './vector-styles/LineColor.svelte'
  import LineDasharray from './vector-styles/LineDasharray.svelte'
  import LineJoin from './vector-styles/LineJoin.svelte'
  import FillOutlineColor from './vector-styles/FillOutlineColor.svelte'
  import FillColor from './vector-styles/FillColor.svelte'
  import IconImage from './vector-styles/IconImage.svelte'
  import IconSize from './vector-styles/IconSize.svelte'
  import IconOverlap from './vector-styles/IconOverlap.svelte'
  import IconKeepUpright from './vector-styles/IconKeepUpright.svelte'
  import IconIgnorePlacement from './vector-styles/IconIgnorePlacement.svelte'
  import IconOffset from './vector-styles/IconOffset.svelte'
  import IconColor from './vector-styles/IconColor.svelte'
  import HeatmapIntensity from './vector-styles/HeatmapIntensity.svelte'
  import HeatmapRadius from './vector-styles/HeatmapRadius.svelte'
  import HeatmapWeight from './vector-styles/HeatmapWeight.svelte'
  import HeatmapColor from './vector-styles/HeatmapColor.svelte'

  export let isLegendPanelVisible = false
  export let layer: Layer = LayerInitialValues
  let updateLegend = () => undefined

  const onStyleChange = () => {
    updateLegend()
  }
</script>

{#if isLegendPanelVisible === true}
  <div class="action">
    <VectorLegendSymbol bind:updateLegend {layer} />
    <LineWidth on:change={onStyleChange} {layer} />
    <LineBlur on:change={onStyleChange} {layer} />
    <LineColor on:change={onStyleChange} {layer} />
    <LineDasharray on:change={onStyleChange} {layer} />
    <LineJoin on:change={onStyleChange} {layer} />
    <FillColor on:change={onStyleChange} {layer} />
    <FillOutlineColor on:change={onStyleChange} {layer} />
    <IconImage on:change={onStyleChange} {layer} />
    <IconColor on:change={onStyleChange} {layer} />
    <IconSize on:change={onStyleChange} {layer} />
    <IconOverlap on:change={onStyleChange} {layer} />
    <IconKeepUpright on:change={onStyleChange} {layer} />
    <IconIgnorePlacement on:change={onStyleChange} {layer} />
    <IconOffset on:change={onStyleChange} {layer} />
    <HeatmapColor on:change={onStyleChange} {layer} />
    <HeatmapIntensity on:change={onStyleChange} {layer} />
    <HeatmapRadius on:change={onStyleChange} {layer} />
    <HeatmapWeight on:change={onStyleChange} {layer} />
  </div>
{/if}

<style lang="scss">
  .action {
    margin-bottom: 25px;
  }
</style>
