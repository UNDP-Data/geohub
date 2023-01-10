<script lang="ts">
  import { onMount } from 'svelte'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
  } from '$lib/constants'
  import type { RasterTileSource } from 'maplibre-gl'
  import { cloneDeep, debounce } from 'lodash-es'
  import {
    fetchUrl,
    generateColorMap,
    getActiveBandIndex,
    getLayerStyle,
    getValueFromRasterTileUrl,
    updateParamsInURL,
  } from '$lib/helper'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import IntervalsLegendColorMapRow from '$components/controls/IntervalsLegendColorMapRow.svelte'
  import type { IntervalLegendColorMapRow, Layer, RasterLayerStats, RasterTileMetadata } from '$lib/types'
  import { layerList, map } from '$stores'
  import { getMaxValueOfCharsInIntervals } from '$lib/helper/getMaxValueOfCharsInIntervals'

  export let colorPickerVisibleIndex: number
  export let layerConfig: Layer
  export let numberOfClasses = COLOR_CLASS_COUNT
  export let colorClassCountMax = COLOR_CLASS_COUNT_MAXIMUM
  export let colorClassCountMin = COLOR_CLASS_COUNT_MINIMUM
  export let colorMapName: string
  $: colorMapName, colorManNameChanged()

  const colorManNameChanged = () => {
    getColorMapRows()
    reclassifyImage()
  }

  let info: RasterTileMetadata
  ;({ info } = layerConfig)
  const bandIndex = getActiveBandIndex(info)

  let layerMax
  let layerMin
  let rowWidth: number
  if ('stats' in info) {
    const band = Object.keys(info.stats)[bandIndex]
    layerMin = Number(info.stats[band].min)
    layerMax = Number(info.stats[band].max)
  } else {
    const [band, bandMetaStats] = info['band_metadata'][bandIndex]
    layerMin = Number(bandMetaStats['STATISTICS_MINIMUM'])
    layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM'])
  }

  export let classificationMethod: ClassificationMethodTypes
  let percentile98: number = info.stats[Object.keys(info.stats)[bandIndex]]['percentile_98']
  let classificationMethods = [
    { name: ClassificationMethodNames.NATURAL_BREAK, code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
    { name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC },
  ]
  let colorMapRows: IntervalLegendColorMapRow[] = []

  onMount(async () => {
    const rasterInfo = info as RasterTileMetadata
    if (!rasterInfo?.isMosaicJson) {
      const layerSrc: RasterTileSource = $map.getSource(getLayerStyle($map, layerConfig.id).source) as RasterTileSource
      const layerURL = new URL(layerSrc.tiles[0])
      const statsURL = `${PUBLIC_TITILER_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}&histogram_bins=20`
      const layerStats: RasterLayerStats = await fetchUrl(statsURL)
      info = { ...info, stats: layerStats }
    }
    const band = info.active_band_no
    percentile98 = info.stats[band]['percentile_98']
    const skewness = 3 * ((info.stats[band].mean - info.stats[band].median) / info.stats[band].std)
    if (classificationMethod === ClassificationMethodTypes.LOGARITHMIC) {
      if (skewness > 1 && skewness > -1) {
        // Layer isn't higly skewed.
        classificationMethod = ClassificationMethodTypes.EQUIDISTANT // Default classification method
      } else {
        classificationMethod = ClassificationMethodTypes.LOGARITHMIC
      }
    }
    layerConfig = { ...layerConfig, info: info }
    const layers = $layerList.map((layer) => {
      return layerConfig.id !== layer.id ? layer : layerConfig
    })
    layerList.set([...layers])
    getColorMapRows()
    colorMapRows.length > 0 ? null : reclassifyImage()
  })

  const getColorMapRows = () => {
    const colormap: number[][][] = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap') as number[][][]
    colorMapRows = []
    if (colormap && colormap.length > 0) {
      colormap.forEach((row: number[][], index: number) => {
        const values = row[0]
        const color = row[1]
        colorMapRows.push({
          color: color,
          index: index,
          start: values[0],
          end: values[1],
        })
      })
    }
    numberOfClasses = colorMapRows.length === 0 ? COLOR_CLASS_COUNT : colorMapRows.length
  }

  const reclassifyImage = (e?: CustomEvent) => {
    let isClassificationMethodEdited = false
    if (e) {
      classificationMethod = (e.target as HTMLSelectElement).value as ClassificationMethodTypes
      isClassificationMethodEdited = true
    }
    // Fixme: Possible bug in titiler. The Max value is not the real max in some layers
    // 0.01 is added to the max value as in some layers, the max value is not the real max value.
    colorMapRows = generateColorMap(
      layerMin,
      layerMax + 0.01,
      colorMapRows,
      numberOfClasses,
      classificationMethod,
      isClassificationMethodEdited,
      percentile98,
      colorMapName,
    )
    rowWidth = getMaxValueOfCharsInIntervals(colorMapRows)
    handleParamsUpdate()

    // fire event for style sharing
    $map?.fire('classification:changed', {
      layerId: layerConfig.id,
      classification: classificationMethod,
    })
  }
  // encode colormap and update url parameters
  const handleParamsUpdate = debounce(() => {
    const encodeColorMapRows = JSON.stringify(colorMapRows.map((row) => [[row.start, row.end], row.color]))
    const layerSrc: RasterTileSource = $map.getSource(getLayerStyle($map, layerConfig.id).source) as RasterTileSource
    const layerURL = new URL(layerSrc.tiles[0])
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    const updatedParams = Object.assign({ colormap: encodeColorMapRows })
    const layerStyle = getLayerStyle($map, layerConfig.id)
    updateParamsInURL(layerStyle, layerURL, updatedParams)
  }, 500)

  const handleIncrementDecrementClasses = (e: CustomEvent) => {
    numberOfClasses = e.detail.value
    const layerConfigClone = cloneDeep(layerConfig)
    layerConfig = layerConfigClone
    colorMapRows = []
    reclassifyImage()
  }

  const generateRowWidth = (colorMapRows) => {
    // for each of the start and end of the colormap rows get the maximum
    // generate rowWidth based on the maximum
    rowWidth = Math.max(
      ...colorMapRows.map((row) => {
        return Math.max(row.start.toString().length, row.end.toString().length)
      }),
    )
  }

  const handleColorPickerClick = (event: CustomEvent) => {
    colorPickerVisibleIndex = event.detail.index
  }
  const handleChangeIntervalValues = (event: CustomEvent) => {
    const rowIndex = event.detail.index
    const inputType = event.detail.id
    let inputValue = event.detail.value as number
    let currentRow = colorMapRows.at(rowIndex)
    if (rowIndex == 0) {
      const nextRow = colorMapRows.at(rowIndex + 1)
      if (inputType == 'start') {
        inputValue = !isNaN(inputValue) && inputValue < currentRow.end ? inputValue : (currentRow.start as number)
        colorMapRows[rowIndex].start = inputValue
      } else {
        inputValue =
          !isNaN(inputValue) && inputValue > currentRow.start && inputValue < nextRow.end
            ? inputValue
            : (currentRow.end as number)
        colorMapRows[rowIndex].end = inputValue
        colorMapRows[rowIndex + 1].start = inputValue
      }
    } else if (rowIndex == colorMapRows.length - 1) {
      const prevRow = colorMapRows.at(rowIndex - 1)
      if (inputType == 'start') {
        inputValue =
          !isNaN(inputValue) && inputValue < currentRow.end && inputValue > prevRow.start
            ? inputValue
            : (currentRow.start as number)
        colorMapRows[rowIndex].start = inputValue
        colorMapRows[rowIndex - 1].end = inputValue
      } else {
        inputValue =
          !isNaN(inputValue) && inputValue <= currentRow.end && inputValue > prevRow.start
            ? inputValue
            : (currentRow.end as number)
        colorMapRows[rowIndex].end = inputValue
      }
    } else {
      const nextRow = colorMapRows.at(rowIndex + 1)
      const prevRow = colorMapRows.at(rowIndex - 1)

      if (inputType == 'start') {
        inputValue =
          !isNaN(inputValue) && inputValue > prevRow.start && inputValue < currentRow.end
            ? inputValue
            : (currentRow.start as number)
        colorMapRows[rowIndex].start = inputValue
        colorMapRows[rowIndex - 1].end = inputValue
      } else {
        inputValue =
          !isNaN(inputValue) && inputValue > currentRow.start && inputValue < nextRow.end
            ? inputValue
            : (currentRow.end as number)
        colorMapRows[rowIndex].end = inputValue
        colorMapRows[rowIndex + 1].start = inputValue
      }
    }
    handleParamsUpdate()
  }
</script>

<div
  class="intervals-view-container"
  data-testid="intervals-view-container">
  <div
    class="columns is-gapless controls"
    on:click={() => (colorPickerVisibleIndex = -1)}>
    <div class="column classification">
      <div class="has-text-centered pb-2">Classification</div>
      <div
        class="select is-flex is-justify-content-center"
        style="height: 30px; width: fit-content">
        <select
          bind:value={classificationMethod}
          on:change={(e) => reclassifyImage(e)}
          style="width: 114px;"
          alt="Classification Methods"
          title="Classification Methods">
          {#each classificationMethods as classificationMethod}
            <option
              class="legend-text"
              value={classificationMethod.code}>{classificationMethod.name}</option>
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
  <div class="is-divider separator mb-4" />

  {#each colorMapRows as colorMapRow}
    <IntervalsLegendColorMapRow
      bind:colorMapRow
      bind:colorMapName
      bind:rowWidth
      layer={layerConfig}
      {colorPickerVisibleIndex}
      on:clickColorPicker={handleColorPickerClick}
      on:closeColorPicker={() => (colorPickerVisibleIndex = -1)}
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
  :global(.select:not(.is-multiple):not(.is-loading)::after) {
    border-color: #ff0000;
  }
</style>
