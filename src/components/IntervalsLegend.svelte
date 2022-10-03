<script lang="ts">
  import { onMount } from 'svelte'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
    LayerInitialValues,
  } from '$lib/constants'
  import type {
    FillLayerSpecification,
    HeatmapLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
  } from 'maplibre-gl'
  import { cloneDeep, debounce } from 'lodash-es'
  import { fetchUrl, generateColorMap, getActiveBandIndex, updateParamsInURL } from '$lib/helper'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import IntervalsLegendColorMapRow from '$components/IntervalsLegendColorMapRow.svelte'
  import type { Layer, RasterLayerStats, RasterTileMetadata } from '$lib/types'
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
  const bandIndex = getActiveBandIndex(info)

  let layerMax
  let layerMin
  if ('stats' in info) {
    const band = Object.keys(info.stats)[bandIndex]
    layerMin = Number(info.stats[band].min)
    layerMax = Number(info.stats[band].max)
  } else {
    const [band, bandMetaStats] = info['band_metadata'][bandIndex]
    layerMin = Number(bandMetaStats['STATISTICS_MINIMUM'])
    layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM'])
  }

  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])
  let classificationMethod = layerConfig.intervals.classification || ClassificationMethodTypes.EQUIDISTANT
  let percentile98: number = layerConfig.percentile98
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
    const statsURL = `${PUBLIC_TITILER_ENDPOINT}/statistics?url=${layerURL.searchParams.get('url')}&histogram_bins=20`
    const layerStats: RasterLayerStats = await fetchUrl(statsURL)
    info = { ...info, stats: layerStats }
    const band = info.active_band_no
    percentile98 = layerStats[band]['percentile_98']
    layerConfig.percentile98 = percentile98
    const skewness = 3 * ((info.stats[band].mean - info.stats[band].median) / info.stats[band].std)
    if (layerConfig.intervals.classification !== ClassificationMethodTypes.LOGARITHMIC) {
      //pass
    } else {
      if (skewness > 1 && skewness > -1) {
        // Layer isn't higly skewed.
        classificationMethod = ClassificationMethodTypes.EQUIDISTANT // Default classification method
        layerConfig.intervals.classification = classificationMethod
      } else {
        classificationMethod = ClassificationMethodTypes.LOGARITHMIC
        layerConfig.intervals.classification = classificationMethod
      }
    }
    layerConfig = { ...layerConfig, info: info }
    const layers = $layerList.map((layer) => {
      return layerConfig.definition.id !== layer.definition.id ? layer : layerConfig
    })
    layerList.set([...layers])
    layerConfig.intervals.colorMapRows.length > 0 ? null : reclassifyImage()
  })

  const reclassifyImage = (e?: CustomEvent) => {
    let isClassificationMethodEdited = false
    if (e) {
      classificationMethod = (e.target as HTMLSelectElement).value as ClassificationMethodTypes
      isClassificationMethodEdited = true
    }
    // Fixme: Possible bug in titiler. The Max value is not the real max in some layers
    // 0.01 is added to the max value as in some layers, the max value is not the real max value.
    layerConfig.intervals.colorMapRows = generateColorMap(
      layerConfig,
      layerMin,
      layerMax + 0.01,
      numberOfClasses,
      classificationMethod,
      isClassificationMethodEdited,
      percentile98,
    )
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
      <div class="select is-flex is-justify-content-center" style="height: 30px; width: fit-content">
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
  <div class="is-divider separator mb-4" />
  {#each layerConfig.intervals.colorMapRows as colorMapRow}
    <IntervalsLegendColorMapRow
      bind:colorMapRow
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
