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
    getLayerStyle,
    updateParamsInURL,
    getLayerSourceUrl,
    getMaxValueOfCharsInIntervals,
    remapInputValue,
  } from '$lib/helper'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import IntervalsLegendColorMapRow from '$components/controls/IntervalsLegendColorMapRow.svelte'
  import type { IntervalLegendColorMapRow, Layer } from '$lib/types'
  import { map } from '$stores'
  import { updateIntervalValues } from '$lib/helper/updateIntervalValues'
  import ColorMapPicker from './ColorMapPicker.svelte'

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
  export let generateCmap: boolean

  $: colorMapName, colorMapNameChanged()

  const colorMapNameChanged = () => {
    // this also happens on init/mounting. because of this it is not posisble to know when the colormap has been changed
    // or when the component is being created. On demand (event based approach) might be better

    // the map is updated whene the colormap is chenged intentionally or whne it is initialized first time
    if ((colorMapName && generateCmap) || (colorMapName && colorMapRows.length == 0)) {
      reclassifyImage()
    } // not right
    else {
      handleParamsUpdate()
    }
  }

  let { info }: Layer = layerConfig
  const bandIndex = getActiveBandIndex(info)
  let layerMax
  let layerMin
  let layerMean
  let rowWidth: number
  if ('stats' in info) {
    const band = Object.keys(info.stats)[bandIndex]

    layerMin = Number(info.stats[band].min)
    layerMax = Number(info.stats[band].max)
    layerMean = Number(info.stats[band].mean)
  } else {
    const [band, bandMetaStats] = info['band_metadata'][bandIndex]
    layerMin = Number(bandMetaStats['STATISTICS_MINIMUM'])
    layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM'])
    layerMean = Number(bandMetaStats['STATISTICS_MEAN'])
  }
  const layerMeanToMax = layerMean / layerMax
  let percentile98: number = info.stats[Object.keys(info.stats)[bandIndex]]['percentile_98']
  let classificationMethods = [
    { name: ClassificationMethodNames.NATURAL_BREAK, code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
    { name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC },
  ]

  if (layerMeanToMax >= -0.5 && layerMeanToMax <= 0.5) classificationMethod = ClassificationMethodTypes.LOGARITHMIC
  if ((layerMeanToMax > -5 && layerMeanToMax < -0.5) || (layerMeanToMax > 0.5 && layerMeanToMax < 5))
    classificationMethod = ClassificationMethodTypes.NATURAL_BREAK
  if (layerMeanToMax <= -5 && layerMeanToMax >= 5) classificationMethod = ClassificationMethodTypes.EQUIDISTANT

  onMount(async () => {
    //const rasterInfo = info as RasterTileMetadata

    // if (!rasterInfo?.isMosaicJson) {
    //   const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string

    //   const layerURL = new URL(layerUrl)

    //   const statsURL = `${PUBLIC_TITILER_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}&histogram_bins=20`
    //   const layerStats: RasterLayerStats = await fetchUrl(statsURL)
    //   info = { ...info, stats: layerStats }
    // }
    // const band = info?.active_band_no
    // percentile98 = info?.stats[band]['percentile_98']

    // //skewness based
    // const skewness = 3 * ((info.stats[band].mean - info.stats[band].median) / info.stats[band].std)
    // if (skewness>-.5 && skewness < .5) classificationMethod = ClassificationMethodTypes.EQUIDISTANT
    // if (skewness>-1 && skewness<-.5 || skewness>.5 && skewness < 1) classificationMethod = ClassificationMethodTypes.NATURAL_BREAK
    // if (skewness<-1 || skewness> 1) classificationMethod = ClassificationMethodTypes.LOGARITHMIC

    //based on mean/max ratio

    // if (layerMeanToMax >= -0.5 && layerMeanToMax <= 0.5) classificationMethod = ClassificationMethodTypes.LOGARITHMIC
    // if ((layerMeanToMax > -5 && layerMeanToMax < -0.5) || (layerMeanToMax > 0.5 && layerMeanToMax < 5))
    //   classificationMethod = ClassificationMethodTypes.NATURAL_BREAK
    // if (layerMeanToMax <= -5 && layerMeanToMax >= 5) classificationMethod = ClassificationMethodTypes.EQUIDISTANT

    // layerConfig = { ...layerConfig, info: info }
    // const layers = $layerList.map((layer) => {
    //   return layerConfig.id !== layer.id ? layer : layerConfig
    // })
    // layerList.set([...layers])

    // this fucntion is useless, really, at the time when on mount is executed the map has not been yet updated and
    // the colormap object does not exist in the layer's url. A forced sync with the map might be better
    // and could work. However, with the introduction of colorMapRows in te state management
    // this funcntion becomes obsolete. and should be removed

    if (colorMapRows.length == 0) {
      reclassifyImage()
    }
  })

  // const getColorMapRows = () => {
  //   const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string
  //   const layerURL = new URL(layerUrl)
  //   console.log(layerUrl)

  //   const colormap: number[][][] = getValueFromRasterTileUrl($map, layerConfig.id, 'colormap') as number[][][]

  //   console.log(colormap)
  //   colorMapRows = []
  //   if (colormap && colormap.length > 0) {
  //     colormap.forEach((row: number[][], index: number) => {
  //       const values = row[0]
  //       const color = row[1]
  //       colorMapRows.push({
  //         color: color,
  //         index: index,
  //         start: values[0],
  //         end: values[1],
  //       })
  //     })
  //   }
  //   numberOfClasses = colorMapRows.length === 0 ? numberOfClasses : colorMapRows.length
  // }

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

  // it is very interesting that without debounce it does NOW properly
  // encode colormap and update url parameters
  const handleParamsUpdate = () => {
    const encodeColorMapRows = JSON.stringify(
      colorMapRows.map((row) => {
        if (row.color[3] === 255) {
          return [[row.start, row.end], row.color]
        } else {
          const a = remapInputValue(row.color[3], 0, 1, 0, 255)
          const color = [row.color[0], row.color[1], row.color[2], Math.floor(a)]
          return [[row.start, row.end], color]
        }
      }),
    )
    const layerUrl = getLayerSourceUrl($map, layerConfig.id) as string
    if (!(layerUrl && layerUrl.length > 0)) return
    const layerURL = new URL(layerUrl)
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    const updatedParams = Object.assign({ colormap: encodeColorMapRows })
    const layerStyle = getLayerStyle($map, layerConfig.id)
    updateParamsInURL(layerStyle, layerURL, updatedParams)
  }

  const handleIncrementDecrementClasses = (e: CustomEvent) => {
    numberOfClasses = e.detail.value
    const layerConfigClone = cloneDeep(layerConfig)
    layerConfig = layerConfigClone
    colorMapRows = []
    reclassifyImage()
  }

  const handleChangeIntervalValues = (event: CustomEvent) => {
    colorMapRows = updateIntervalValues(event, colorMapRows)
    rowWidth = getMaxValueOfCharsInIntervals(colorMapRows)
    handleParamsUpdate()
  }
</script>

<div
  class="intervals-view-container"
  data-testid="intervals-view-container">
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="legend-controls">
    <div class="classification field pr-2">
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <label class="label has-text-centered">Classification</label>
      <div class="control">
        <select
          bind:value={classificationMethod}
          on:change={(e) => reclassifyImage(e)}
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

    <div class="number-classes field pr-2">
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

    <div class="colormap-picker">
      <ColorMapPicker
        bind:colorMapName
        on:colorMapChanged={() => {
          colorMapNameChanged()
          reclassifyImage()
        }} />
    </div>
  </div>
  <div class="is-divider separator mb-4" />

  {#each colorMapRows as colorMapRow}
    <IntervalsLegendColorMapRow
      bind:colorMapRow
      bind:colorMapName
      bind:rowWidth
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
</style>
