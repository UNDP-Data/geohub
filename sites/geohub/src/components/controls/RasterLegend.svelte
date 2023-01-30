<script lang="ts">
  import { slide } from 'svelte/transition'
  import RasterContinuousLegend from '$components/controls/RasterContinuousLegend.svelte'
  import RasterAdvancedLegend from '$components/controls/RasterAdvancedLegend.svelte'
  import { DynamicLayerLegendTypes, ClassificationMethodTypes, LegendTypes } from '$lib/constants'
  import type { Layer, IntervalLegendColorMapRow } from '$lib/types'
  import LegendTypeSwitcher from './LegendTypeSwitcher.svelte'

  export let layer: Layer
  export let legendType: LegendTypes
  export let classificationMethod: ClassificationMethodTypes
  export let colorMapName: string
  export let numberOfClasses: number
  export let colorMapRows: Array<IntervalLegendColorMapRow>

  let rasterLegendType: DynamicLayerLegendTypes

  let colorPickerVisibleIndex: number

  $: legendType, handleLegendToggleClick()
  const handleLegendToggleClick = () => {
    colorPickerVisibleIndex = -1
    if (legendType === LegendTypes.CLASSIFY) {
      rasterLegendType = DynamicLayerLegendTypes.INTERVALS
    } else {
      rasterLegendType = DynamicLayerLegendTypes.CONTINUOUS
    }
  }
</script>

<LegendTypeSwitcher bind:legendType />

{#if rasterLegendType === DynamicLayerLegendTypes.CONTINUOUS}
  <div transition:slide>
    <RasterContinuousLegend
      bind:layerConfig={layer}
      bind:colorMapName
      bind:numberOfClasses />
  </div>
{:else if rasterLegendType === DynamicLayerLegendTypes.INTERVALS}
  <div transition:slide>
    <RasterAdvancedLegend
      bind:layerConfig={layer}
      bind:colorMapName
      bind:classificationMethod
      bind:numberOfClasses
      bind:colorMapRows />
  </div>
{/if}
