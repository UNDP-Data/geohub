<script lang="ts">
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import VectorLegendSymbol from './VectorLegendSymbol.svelte'
  import MinMaxZoom from './vector-styles/MinMaxZoom.svelte'
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

  export let layer: Layer = LayerInitialValues
  let updateLegend = () => undefined
</script>

<div>
  <VectorLegendSymbol bind:updateLegend {layer} />
  <MinMaxZoom on:change={updateLegend} {layer} />
  <LineWidth on:change={updateLegend} {layer} />
  <LineBlur on:change={updateLegend} {layer} />
  <LineColor on:change={updateLegend} {layer} />
  <LineDasharray on:change={updateLegend} {layer} />
  <LineJoin on:change={updateLegend} {layer} />
  <FillColor on:change={updateLegend} {layer} />
  <FillOutlineColor on:change={updateLegend} {layer} />
  <IconImage on:change={updateLegend} {layer} />
  <IconColor on:change={updateLegend} {layer} />
  <IconSize on:change={updateLegend} {layer} />
  <IconOverlap on:change={updateLegend} {layer} />
  <IconKeepUpright on:change={updateLegend} {layer} />
  <IconIgnorePlacement on:change={updateLegend} {layer} />
  <IconOffset on:change={updateLegend} {layer} />
</div>

<style lang="scss">
</style>
