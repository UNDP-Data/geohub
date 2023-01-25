<script lang="ts">
  import { slide } from 'svelte/transition'
  import RasterContinuousLegend from '$components/controls/RasterContinuousLegend.svelte'
  import RasterIntervalsLegend from '$components/controls/RasterIntervalsLegend.svelte'
  import RasterUniqueValuesLegend from '$components/controls/RasterUniqueValuesLegend.svelte'
  import { DynamicLayerLegendTypes, COLOR_CLASS_COUNT_MAXIMUM, ClassificationMethodTypes } from '$lib/constants'
  import type { Layer, RasterTileMetadata, IntervalLegendColorMapRow } from '$lib/types'
  import LegendTypeSwitcher from './LegendTypeSwitcher.svelte'

  export let layer: Layer
  export let legendType: 'simple' | 'advanced'
  export let classificationMethod: ClassificationMethodTypes
  export let colorMapName: string
  export let numberOfClasses: number
  export let colorMapRows: Array<IntervalLegendColorMapRow>

  let rasterLegendType: DynamicLayerLegendTypes

  let { info }: Layer = layer

  let colorPickerVisibleIndex: number
  let layerHasUniqueValues = false
  let showTooltip = false

  $: legendType, handleLegendToggleClick()
  const handleLegendToggleClick = () => {
    colorPickerVisibleIndex = -1
    let bandName

    try {
      bandName = Object.keys((info as RasterTileMetadata).stats)
    } catch (e) {
      console.log(e)
    }
    layerHasUniqueValues =
      Number((info as RasterTileMetadata).stats[bandName]['unique']) <= COLOR_CLASS_COUNT_MAXIMUM &&
      !(info as RasterTileMetadata).dtype.startsWith('float')

    if (legendType === 'advanced') {
      rasterLegendType = layerHasUniqueValues ? DynamicLayerLegendTypes.UNIQUE : DynamicLayerLegendTypes.INTERVALS
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
    <RasterIntervalsLegend
      bind:layerConfig={layer}
      bind:colorMapName
      bind:classificationMethod
      bind:numberOfClasses
      bind:colorMapRows
      bind:generateCmap={showTooltip} />
  </div>
{:else if rasterLegendType === DynamicLayerLegendTypes.UNIQUE}
  <div transition:slide>
    <RasterUniqueValuesLegend
      bind:layerConfig={layer}
      bind:colorPickerVisibleIndex
      bind:colorMapName />
  </div>
{/if}
