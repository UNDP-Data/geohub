<script lang="ts">
  import type { Layer } from '$lib/types'
  import { LayerInitialValues } from '$lib/constants'
  import VectorLegendSymbol from '$components/controls/VectorLegendSymbol.svelte'
  import LineWidth from '$components/controls/vector-styles/LineWidth.svelte'
  import LineBlur from '$components/controls/vector-styles/LineBlur.svelte'
  import LineColor from '$components/controls/vector-styles/LineColor.svelte'
  import LineDasharray from '$components/controls/vector-styles/LineDasharray.svelte'
  import LineJoin from '$components/controls/vector-styles/LineJoin.svelte'
  import FillOutlineColor from '$components/controls/vector-styles/FillOutlineColor.svelte'
  import FillColor from '$components/controls/vector-styles/FillColor.svelte'
  import IconImage from '$components/controls/vector-styles/IconImage.svelte'
  import IconSize from '$components/controls/vector-styles/IconSize.svelte'
  import IconOverlap from '$components/controls/vector-styles/IconOverlap.svelte'
  import IconKeepUpright from '$components/controls/vector-styles/IconKeepUpright.svelte'
  import IconIgnorePlacement from '$components/controls/vector-styles/IconIgnorePlacement.svelte'
  import IconOffset from '$components/controls/vector-styles/IconOffset.svelte'
  import IconColor from '$components/controls/vector-styles/IconColor.svelte'
  import HeatmapIntensity from '$components/controls/vector-styles/HeatmapIntensity.svelte'
  import HeatmapRadius from '$components/controls/vector-styles/HeatmapRadius.svelte'
  import HeatmapWeight from '$components/controls/vector-styles/HeatmapWeight.svelte'
  import HeatmapColor from '$components/controls/vector-styles/HeatmapColor.svelte'

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
