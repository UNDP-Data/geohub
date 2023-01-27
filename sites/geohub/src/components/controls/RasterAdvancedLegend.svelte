<script lang="ts">
  import { onMount } from 'svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
  } from '$lib/constants'
  import { cloneDeep } from 'lodash-es'
  import {
    generateColorMap,
    getActiveBandIndex,
    getLayerSourceUrl,
    getLayerStyle,
    getMaxValueOfCharsInIntervals,
    getValueFromRasterTileUrl,
    remapInputValue,
    updateParamsInURL,
  } from '$lib/helper'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import IntervalsLegendColorMapRow from '$components/controls/IntervalsLegendColorMapRow.svelte'
  import type { IntervalLegendColorMapRow, Layer } from '$lib/types'
  import { map } from '$stores'
  import { updateIntervalValues } from '$lib/helper/updateIntervalValues'
  import ColorMapPicker from './ColorMapPicker.svelte'
  import chroma from 'chroma-js'
  //console.clear()
  export let layerConfig: Layer
  export let numberOfClasses: number
  export let colorClassCountMax = COLOR_CLASS_COUNT_MAXIMUM
  export let colorClassCountMin = COLOR_CLASS_COUNT_MINIMUM
  export let colorMapName: string
  export let classificationMethod: ClassificationMethodTypes
  export let colorMapRows: Array<IntervalLegendColorMapRow>
  // this var is necessary to maintain the state of teh colormap when switching the legend.
  // and it should be set by the bool flags that control the colormap picker visibility from parent container

  let { info }: Layer = layerConfig
  const bandIndex = getActiveBandIndex(info)
  const [band, bandMetaStats] = info['band_metadata'][bandIndex]

  let layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM'])
  let layerMin = Number(bandMetaStats['STATISTICS_MINIMUM'])
  let layerMean = Number(bandMetaStats['STATISTICS_MEAN'])

  let legendLabels = {}
  let layerHasUniqueValues = Object.keys(bandMetaStats['STATISTICS_UNIQUE_VALUES']).length > 0
  let rowWidth: number
  let percentile98: number = info.stats[Object.keys(info.stats)[bandIndex]]['percentile_98']
  let classificationMethods = [
    { name: ClassificationMethodNames.NATURAL_BREAK, code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
    { name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC },
  ]

  if (!layerHasUniqueValues) {
    const layerMeanToMax = layerMean / layerMax
    if (layerMeanToMax >= -0.5 && layerMeanToMax <= 0.5) classificationMethod = ClassificationMethodTypes.LOGARITHMIC
    if ((layerMeanToMax > -5 && layerMeanToMax < -0.5) || (layerMeanToMax > 0.5 && layerMeanToMax < 5))
      classificationMethod = ClassificationMethodTypes.NATURAL_BREAK
    if (layerMeanToMax <= -5 && layerMeanToMax >= 5) classificationMethod = ClassificationMethodTypes.EQUIDISTANT
  } else {
    legendLabels = bandMetaStats['STATISTICS_UNIQUE_VALUES']
  }

  const setColorMapRows = (e?: CustomEvent) => {
    if (layerHasUniqueValues) {
      let colorsList = chroma.scale(colorMapName).mode('lrgb').colors(Object.keys(legendLabels).length)
      colorMapRows = Object.keys(legendLabels).map((key, index) => {
        return {
          index: index,
          start: Number(key),
          end: legendLabels[key],
          color: chroma(colorsList[index]).rgba(),
        }
      })
    } else {
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
    }
    numberOfClasses = colorMapRows.length
  }

  const isInitialMount = () => {
    const colormap = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap')
    return colormap === null
  }

  onMount(async () => {
    if (isInitialMount()) {
      setColorMapRows()
      classifyImage()
    } else {
      setColorMapRowsFromURL()
    }
  })

  const classifyImage = () => {
    let encodedColorMapRows
    if (layerHasUniqueValues) {
      let urlColorMap = {}
      colorMapRows.forEach((row) => {
        urlColorMap[row.start] = [row.color[0], row.color[1], row.color[2], remapInputValue(row.color[3], 0, 1, 0, 255)]
      })
      encodedColorMapRows = JSON.stringify(urlColorMap)
    } else {
      let urlColorMap = []
      colorMapRows.forEach((row) => {
        urlColorMap.push([
          [row.start, row.end],
          [row.color[0], row.color[1], row.color[2], remapInputValue(row.color[3], 0, 1, 0, 255)],
        ])
      })
      encodedColorMapRows = JSON.stringify(urlColorMap)
    }
    handleParamsUpdate(encodedColorMapRows)
    // fire event for style sharing
    $map?.fire('classification:changed', {
      layerId: layerConfig.id,
      classification: classificationMethod,
    })
  }

  const setColorMapRowsFromURL = () => {
    if (layerHasUniqueValues) {
      const colormap = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap')
      if (colormap) {
        colorMapRows = Object.keys(colormap).map((key, index) => {
          return {
            index: index,
            start: key,
            end: legendLabels[key],
            color: [
              colormap[key][0],
              colormap[key][1],
              colormap[key][2],
              remapInputValue(colormap[key][3], 0, 255, 0, 1),
            ],
          }
        })
      }
    } else {
      const colormap = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap')
      if (colormap) {
        colorMapRows = colormap.map((item, index) => {
          return {
            index: index,
            start: item[0][0],
            end: item[0][1],
            color: [item[1][0], item[1][1], item[1][2], remapInputValue(item[1][3], 0, 255, 0, 1)],
          }
        })
      }
    }
  }
  const colorMapNameChanged = () => {
    const colorsList = chroma.scale(colorMapName).mode('lrgb').colors(numberOfClasses)
    colorMapRows = colorMapRows.map((row, index) => {
      return {
        index: index,
        start: row.start,
        end: row.end,
        color: chroma(colorsList[index]).rgba(),
      }
    })
    classifyImage()
  }

  const handleIncrementDecrementClasses = (e: CustomEvent) => {
    numberOfClasses = e.detail.value
    layerConfig = cloneDeep(layerConfig)
    colorMapRows = []
    setColorMapRows()
    classifyImage()
  }

  const handleChangeIntervalValues = (event: CustomEvent) => {
    colorMapRows = updateIntervalValues(event, colorMapRows)
    rowWidth = getMaxValueOfCharsInIntervals(colorMapRows)
    classifyImage()
  }

  const handleClassificationMethodChange = (e) => {
    setColorMapRows(e)
    classifyImage()
  }

  const handleParamsUpdate = (encodeColorMapRows) => {
    const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string
    if (!(layerUrl && layerUrl.length > 0)) return
    const layerURL = new URL(layerUrl)
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    const updatedParams = Object.assign({ colormap: encodeColorMapRows })
    const layerStyle = getLayerStyle($map, layerConfig.id)
    updateParamsInURL(layerStyle, layerURL, updatedParams)
  }

  const handleChangeColorMap = () => {
    classifyImage()
  }
</script>

<div
  class="intervals-view-container"
  data-testid="intervals-view-container">
  <!-- svelte-ignore a11y-click-teevents-have-key-events -->

  <div class="legend-controls mb-4">
    <div
      class="classification field pr-2"
      hidden={layerHasUniqueValues}>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label has-text-centered">Classification</label>
      <div class="control">
        <select
          bind:value={classificationMethod}
          on:change={handleClassificationMethodChange}
          style="width: 114px;"
          title="Classification Methods">
          {#each classificationMethods as classificationMethod}
            <option
              class="legend-text"
              value={classificationMethod.code}>{classificationMethod.name}</option>
          {/each}
        </select>
      </div>
    </div>

    <div
      class="number-classes field pr-2"
      hidden={layerHasUniqueValues}>
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label has-text-centered">Number of Classes</label>
      <div class="control">
        <NumberInput
          bind:value={numberOfClasses}
          bind:minValue={colorClassCountMin}
          bind:maxValue={colorClassCountMax}
          on:change={handleIncrementDecrementClasses} />
      </div>
    </div>
    <div
      class="colormap-picker"
      style={layerHasUniqueValues ? 'margin-right:0%' : null}>
      <ColorMapPicker
        bind:colorMapName
        on:colorMapChanged={() => {
          colorMapNameChanged()
        }} />
    </div>
  </div>

  <div class="colormap-rows-container">
    {#each colorMapRows as colorMapRow}
      <IntervalsLegendColorMapRow
        bind:colorMapRow
        bind:colorMapName
        bind:hasUniqueValues={layerHasUniqueValues}
        bind:rowWidth
        on:changeColorMap={handleChangeColorMap}
        on:changeIntervalValues={handleChangeIntervalValues} />
    {/each}
  </div>
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

  .legend-controls {
    display: flex;
    justify-content: flex-start;
    align-items: center;

    .number-classes {
      margin: 0 auto;
    }

    .colormap-picker {
      margin-left: auto;
    }
  }

  .colormap-rows-container {
    overflow-y: auto;
    max-height: 200px;
  }
</style>
