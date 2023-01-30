<script lang="ts">
  import { slide } from 'svelte/transition'
  import RasterDefaultLegend from '$components/controls/RasterDefaultLegend.svelte'
  import RasterClassifyLegend from '$components/controls/RasterClassifyLegend.svelte'
  import { ClassificationMethodTypes, LegendTypes } from '$lib/constants'
  import type { Layer, IntervalLegendColorMapRow } from '$lib/types'
  import LegendTypeSwitcher from './LegendTypeSwitcher.svelte'

  export let layer: Layer
  export let legendType: LegendTypes
  export let classificationMethod: ClassificationMethodTypes
  export let colorMapName: string
  export let numberOfClasses: number
  export let colorMapRows: Array<IntervalLegendColorMapRow>
</script>

<LegendTypeSwitcher bind:legendType />

{#if legendType === LegendTypes.DEFAULT}
  <div transition:slide>
    <RasterDefaultLegend
      bind:layerConfig={layer}
      bind:colorMapName />
  </div>
{:else if legendType === LegendTypes.CLASSIFY}
  <div transition:slide>
    <RasterClassifyLegend
      bind:layerConfig={layer}
      bind:colorMapName
      bind:classificationMethod
      bind:numberOfClasses
      bind:colorMapRows />
  </div>
{/if}
