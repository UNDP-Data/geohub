<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import IntervalList from '$lib/intervalList'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
    LayerInitialValues,
    TITILER_API_ENDPOINT,
    NO_RANDOM_SAMPLING_POINTS,
  } from '$lib/constants'
  import type {
    FillLayerSpecification,
    HeatmapLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { cloneDeep, debounce } from 'lodash-es'
  import { fetchUrl, updateParamsInURL } from '$lib/helper'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import IntervalsLegendColorMapRow from '$components/IntervalsLegendColorMapRow.svelte'
  import type { IntervalLegendColorMapRow, Layer, RasterLayerStats, RasterTileMetadata } from '$lib/types'
  import { layerList, map } from '$stores'

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
  let percentile98
  let classificationMethods = [
    { name: ClassificationMethodNames.NATURAL_BREAK, code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
    { name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC },
  ]
  let colorMapName = layerConfig.colorMapName

  $: {
    if (layerConfig && colorMapName !== layerConfig.colorMapName) {
      colorMapName = layerConfig.colorMapName
      reclassifyImage()
    }
  }

  onMount(async () => {
    if (!('stats' in info)) {
      const statsURL = `${TITILER_API_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}&histogram_bins=20`
      const layerStats: RasterLayerStats = await fetchUrl(statsURL)

      info = { ...info, stats: layerStats }

      percentile98 = layerStats['1']['percentile_98']

      const skewness = 3 * ((info.stats['1'].mean - info.stats['1'].median) / info.stats['1'].std)
      if (skewness > 1 && skewness > -1) {
        // Layer isn't higly skewed.
        classificationMethod = ClassificationMethodTypes.EQUIDISTANT // Default classification method
        layerConfig.intervals.classification = classificationMethod
      } else {
        classificationMethod = ClassificationMethodTypes.LOGARITHMIC
        layerConfig.intervals.classification = classificationMethod
      }

      layerConfig = { ...layerConfig, info: info }
      const layers = $layerList.filter((layer) => layerConfig.definition.id !== layer.definition.id)
      layerList.set([layerConfig, ...layers])
    }
    reclassifyImage()
  })

  const reclassifyImage = (e?: CustomEvent) => {
    let isClassificationMethodEdited = false
    if (e) {
      classificationMethod = (e.target as HTMLSelectElement).value as ClassificationMethodTypes
      isClassificationMethodEdited = true
    }
    const bins: number[] = info.stats['1'].histogram[1]
    const counts: number[] = info.stats['1'].histogram[0]
    const intervalListHelper = new IntervalList(bins.slice(0, bins.length - 1), counts)
    const colorMap = []

    if (classificationMethod === ClassificationMethodTypes.LOGARITHMIC) {
      const randomSample = intervalListHelper.getSampleFromInterval(layerMin, percentile98, NO_RANDOM_SAMPLING_POINTS)

      // reclassifyForLog()
      const intervalList = intervalListHelper.getIntervalList(
        classificationMethod,
        layerMin,
        percentile98,
        randomSample,
        numberOfClasses,
      )
      // intervalList.splice(intervalList.length - 2, intervalList[intervalList.length - 1])
      const scaleColorList = chroma.scale(layerConfig.colorMapName).classes(intervalList)
      for (let i = 0; i <= numberOfClasses - 2; i++) {
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
      const lastRow: IntervalLegendColorMapRow = {
        index: numberOfClasses - 1,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        color: [...scaleColorList(intervalList[numberOfClasses - 1]).rgb(), 255],
        start: Math.floor(percentile98),
        end: Math.ceil(layerMax),
      }
      colorMap.push(lastRow)
      const replaceIndex = colorMap[colorMap.length - 2]
      replaceIndex['end'] = Math.floor(percentile98)

      colorMap.splice(colorMap.length - 2, replaceIndex)
    } else {
      const randomSample = intervalListHelper.getRandomSample()
      console.log(randomSample)
      const intervalList = intervalListHelper.getIntervalList(
        classificationMethod,
        layerMin,
        layerMax,
        randomSample,
        numberOfClasses,
      )

      const scaleColorList = chroma.scale(layerConfig.colorMapName).classes(intervalList)
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
      <div class="has-text-centered pb-2">Classification</div>
      <div class="select is-rounded is-flex is-justify-content-center" style="height: 30px; width: fit-content">
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
      <div class="has-text-centered">Number of Classes</div>
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
