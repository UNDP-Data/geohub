<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import type {
    FillLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import { cloneDeep, debounce } from 'lodash-es'

  import IntervalsLegendColorMapRow from '$components/IntervalsLegendColorMapRow.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    LayerInitialValues,
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MINIMUM,
    COLOR_CLASS_COUNT_MAXIMUM,
  } from '$lib/constants'
  import { updateParamsInURL } from '$lib/helper'
  import type { IntervalLegendColorMapRow, Layer, RasterTileMetadata } from '$lib/types'
  import { map } from '$stores'
  import NumberInput from './controls/NumberInput.svelte'

  export let colorPickerVisibleIndex: number
  export let layerConfig: Layer = LayerInitialValues
  export let numberOfClasses = layerConfig.intervals.numberOfClasses || COLOR_CLASS_COUNT
  export let colorClassCountMax = COLOR_CLASS_COUNT_MAXIMUM
  export let colorClassCountMin = COLOR_CLASS_COUNT_MINIMUM

  let definition:
    | RasterLayerSpecification
    | FillLayerSpecification
    | LineLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  let info: RasterTileMetadata
  ;({ definition, info } = layerConfig)

  const layerMax = Number(info.band_metadata[0][1]['STATISTICS_MAXIMUM'])
  const layerMin = Number(info.band_metadata[0][1]['STATISTICS_MINIMUM'])
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let classificationMethod = layerConfig.intervals.classification || ClassificationMethodTypes.EQUIDISTANT
  let classificationMethods = [
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]
  let colorMapName = layerConfig.colorMapName

  $: {
    if (layerConfig && colorMapName !== layerConfig.colorMapName) {
      colorMapName = layerConfig.colorMapName
      reclassifyImage()
    }
  }

  onMount(() => {
    if (layerMin > 0) {
      classificationMethods = [
        ...classificationMethods,
        ...[{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC }],
      ]
    }

    reclassifyImage()
  })

  const reclassifyImage = (e?: CustomEvent) => {
    let isClassificationMethodEdited = false

    if (e) {
      classificationMethod = (e.target as HTMLSelectElement).value as ClassificationMethodTypes
      isClassificationMethodEdited = true
    }

    const intervalList = chroma.limits([layerMin, layerMax], classificationMethod, numberOfClasses).map((element) => {
      return Number(element.toFixed(2))
    })

    const scaleColorList = chroma.scale(layerConfig.colorMapName).classes(intervalList)
    const colorMap = []

    for (let i = 0; i <= numberOfClasses - 1; i++) {
      const row: IntervalLegendColorMapRow = {
        index: i,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        color: [...scaleColorList(intervalList[i]).rgb(), 255],
        start:
          isClassificationMethodEdited == false &&
          layerConfig.intervals.colorMapRows.length > 0 &&
          layerConfig.intervals.numberOfClasses === numberOfClasses &&
          layerConfig.intervals.colorMapRows[i]?.start
            ? layerConfig.intervals.colorMapRows[i].start
            : intervalList[i],
        end:
          isClassificationMethodEdited == false &&
          layerConfig.intervals.colorMapRows.length > 0 &&
          layerConfig.intervals.numberOfClasses === numberOfClasses &&
          layerConfig.intervals.colorMapRows[i]?.end
            ? layerConfig.intervals.colorMapRows[i].end
            : intervalList[i + 1],
      }

      colorMap.push(row)
    }

    layerConfig.intervals.colorMapRows = colorMap
    layerConfig.intervals.classification = classificationMethod
    handleParamsUpdate()
  }

  // encode colormap and update url parameters
  const handleParamsUpdate = debounce(() => {
    const encodeColorMapRows = JSON.stringify(
      layerConfig.intervals.colorMapRows.map((row) => [[row.start, row.end], row.color]),
    )
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    const updatedParams = Object.assign({ colormap: encodeColorMapRows })
    updateParamsInURL(definition, layerURL, updatedParams)
  }, 500)

  const handleIncrementDecrementClasses = (e: CustomEvent) => {
    numberOfClasses = e.detail.value

    const layerConfigClone = cloneDeep(layerConfig)
    layerConfigClone.intervals.numberOfClasses = numberOfClasses
    layerConfig = layerConfigClone
    layerConfig.intervals.colorMapRows = []
    reclassifyImage()
  }

  const handleColorPickerClick = (event: CustomEvent) => {
    colorPickerVisibleIndex = event.detail.index
  }

  const handleChangeIntervalValues = (event: CustomEvent) => {
    const rowIndex = event.detail.index
    const inputType = event.detail.id
    const inputValue = event.detail.value

    if (inputType === 'start' && rowIndex !== 0) {
      layerConfig.intervals.colorMapRows[rowIndex - 1].end = inputValue
    }

    if (inputType === 'end' && rowIndex < layerConfig.intervals.colorMapRows.length - 1) {
      layerConfig.intervals.colorMapRows[rowIndex + 1].start = inputValue
    }

    handleParamsUpdate()
  }
</script>

<div class="intervals-view-container" data-testid="intervals-view-container">
  <div class="columns is-gapless controls" on:click={() => (colorPickerVisibleIndex = -1)}>
    <div class="column classification">
      <div class="is-size-6 is-flex is-justify-content-center" style="margin-bottom: 5px;">Classification</div>
      <div class="select is-rounded is-flex is-justify-content-center" style="height: 30px;">
        <select
          bind:value={classificationMethod}
          on:change={(e) => reclassifyImage(e)}
          style="width: 114px;"
          alt="Classification Methods"
          title="Classification Methods">
          {#each classificationMethods as classificationMethod}
            <option class="legend-text" value={classificationMethod.code}>{classificationMethod.name}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="column number-classes">
      <div class="is-size-6 is-flex is-justify-content-center">Number of Classes</div>
      <NumberInput
        bind:value={numberOfClasses}
        bind:minValue={colorClassCountMin}
        bind:maxValue={colorClassCountMax}
        on:change={handleIncrementDecrementClasses} />
    </div>
  </div>

  {#each layerConfig.intervals.colorMapRows as colorMapRow}
    <IntervalsLegendColorMapRow
      bind:colorMapRow
      layer={layerConfig}
      {colorPickerVisibleIndex}
      on:clickColorPicker={handleColorPickerClick}
      on:changeColorMap={handleParamsUpdate}
      on:changeIntervalValues={handleChangeIntervalValues} />
  {/each}
</div>

<style lang="scss">
  .intervals-view-container {
    .controls {
      margin-bottom: 10px !important;
    }
  }
</style>
