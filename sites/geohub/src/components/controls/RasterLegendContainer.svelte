<script lang="ts">
  import { slide } from 'svelte/transition'
  import RasterContinuousLegend from '$components/controls/RasterContinuousLegend.svelte'
  import RasterAdvancedLegend from '$components/controls/RasterAdvancedLegend.svelte'
  import { DynamicLayerLegendTypes, ClassificationMethodTypes } from '$lib/constants'
  import type { Layer, IntervalLegendColorMapRow } from '$lib/types'
  import LegendTypeSwitcher from './LegendTypeSwitcher.svelte'

  export let layer: Layer
  export let legendType: 'simple' | 'advanced'
  export let classificationMethod: ClassificationMethodTypes
  export let colorMapName: string
  export let numberOfClasses: number
  export let colorMapRows: Array<IntervalLegendColorMapRow>

  let rasterLegendType: DynamicLayerLegendTypes

  let colorPickerVisibleIndex: number
  let showTooltip = false

  $: legendType, handleLegendToggleClick()
  const handleLegendToggleClick = () => {
    colorPickerVisibleIndex = -1
    if (legendType === 'advanced') {
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
      bind:colorMapRows
      bind:generateCmap={showTooltip} />
  </div>
{/if}
