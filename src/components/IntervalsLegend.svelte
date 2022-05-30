<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import { Jenks } from '$lib/jenks'
  import { NO_RANDOM_SAMPLING_POINTS } from '$lib/constants'
  import type {
    FillLayerSpecification,
    LineLayerSpecification,
    RasterLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { cloneDeep, debounce } from 'lodash-es'
  import { fetchUrl } from '$lib/helper'

  import NumberInput from '$components/controls/NumberInput.svelte'
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
  import type { IntervalLegendColorMapRow, Layer, RasterTileMetadata, RasterLayerStats } from '$lib/types'
  import { map, layerList } from '$stores'

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
    { name: ClassificationMethodNames.NATURAL_BREAK, code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]
  let colorMapName = layerConfig.colorMapName

  // update color intervals upon change of color map name
  $: {
    if (layerConfig && colorMapName !== layerConfig.colorMapName) {
      colorMapName = layerConfig.colorMapName
      reclassifyImage()
    }
  }

  function refSort(targetData, refData) {
    var indices = Object.keys(refData)
    indices.sort(function (indexA, indexB) {
      if (refData[indexA] < refData[indexB]) return -1
      if (refData[indexA] > refData[indexB]) return 1
      return 0
    })
    return indices.map(function (i) {
      return targetData[i]
    })
  }

  const goodBinarySearch = (array: Array<number>, sValue: number, ARG_start = 0, ARG_len = 0) => {
    // Range of [start, start+len): only start is inclusive. It works
    // similarly to "...".substr(start, len).indexOf(sValue)
    // `void 0` is shorthand for `undefined`
    var start = (ARG_start === void 0 ? 0 : ARG_start) | 0
    var len = (ARG_len === void 0 ? (array.length | 0) - start : ARG_len) | 0
    len = (len - 1) | 0

    if (len & 0x80000000) {
      const nCB = len & 0x80000000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x40000000) {
      const nCB = len & 0xc0000000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x20000000) {
      const nCB = len & 0xe0000000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x10000000) {
      const nCB = len & 0xf0000000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x8000000) {
      const nCB = len & 0xf8000000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x4000000) {
      const nCB = len & 0xfc000000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x2000000) {
      const nCB = len & 0xfe000000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x1000000) {
      const nCB = len & 0xff000000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x800000) {
      const nCB = len & 0xff800000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x400000) {
      const nCB = len & 0xffc00000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x200000) {
      const nCB = len & 0xffe00000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x100000) {
      const nCB = len & 0xfff00000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x80000) {
      const nCB = len & 0xfff80000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x40000) {
      const nCB = len & 0xfffc0000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x20000) {
      const nCB = len & 0xfffe0000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x10000) {
      const nCB = len & 0xffff0000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x8000) {
      const nCB = len & 0xffff8000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x4000) {
      const nCB = len & 0xffffc000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x2000) {
      const nCB = len & 0xffffe000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x1000) {
      const nCB = len & 0xfffff000
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x800) {
      const nCB = len & 0xfffff800
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x400) {
      const nCB = len & 0xfffffc00
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x200) {
      const nCB = len & 0xfffffe00
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x100) {
      const nCB = len & 0xffffff00
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x80) {
      const nCB = len & 0xffffff80
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x40) {
      const nCB = len & 0xffffffc0
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x20) {
      const nCB = len & 0xffffffe0
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x10) {
      const nCB = len & 0xfffffff0
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x8) {
      const nCB = len & 0xfffffff8
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x4) {
      const nCB = len & 0xfffffffc
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x2) {
      const nCB = len & 0xfffffffe
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x1) {
      const nCB = len & 0xffffffff
      len ^= (len ^ (nCB - 1)) & ((((array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (array[(start + len) | 0] !== sValue) {
      // remove this if-statement to return the next closest
      // element going downwards from the searched-for value
      // OR 0 if the value is less than all values in the
      // array. https://stackoverflow.com/a/44981570/5601591
      return -((-1 - start - len) | 0)
    }
    return (start + len) | 0
  }

  const cumsum = (arr: Array<number>) =>
    arr.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0),
    )

  onMount(async () => {
    if (!('stats' in info)) {
      const statsURL = `${layerURL.origin}/hrea/statistics?url=${layerURL.searchParams.get('url')}`
      const layerStats: RasterLayerStats = await fetchUrl(statsURL)
      info = { ...info, stats: layerStats }
      layerConfig = { ...layerConfig, info: info }
      const layers = $layerList.filter((layer) => layerConfig.definition.id !== layer.definition.id)
      layerList.set([layerConfig, ...layers])
    }
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

    //console.log('reclass')
    const bins: number[] = info.stats['1'].histogram[1]
    const counts: number[] = info.stats['1'].histogram[0]
    //console.log(counts, bins)
    let mid_bins: number[] = []
    for (let i = 0; i < bins.length - 1; i++) {
      const val = (bins[i] + bins[i + 1]) * 0.5
      mid_bins[i] = val
    }
    const rarr = [...Array(NO_RANDOM_SAMPLING_POINTS)].map((e) => Math.random())
    //console.log(mid_bins)
    const cdf = cumsum(counts)
    //console.log(cdf)
    const ncdf = cdf.map((val) => {
      return val / cdf[cdf.length - 1]
    })
    //console.log(ncdf)

    const random_sample = rarr.map((v) => {
      return mid_bins[goodBinarySearch(ncdf, v, 0, 0)]
    })
    let intervalList = []

    // get interval list based on classification method
    if (classificationMethod === ClassificationMethodTypes.NATURAL_BREAK) {
      intervalList = new Jenks([layerMin, ...random_sample, layerMax], numberOfClasses)
        .naturalBreak()
        .map((element) => {
          return Number(element.toFixed(2))
        })
    } else {
      intervalList = chroma
        .limits([layerMin, ...random_sample, layerMax], classificationMethod, numberOfClasses)
        .map((element) => {
          return Number(element.toFixed(2))
        })
    }

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
      <div class="has-text-centered pb-2">Classification</div>
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
