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
  import Fa from 'svelte-fa'
  import { faCircleMinus } from '@fortawesome/free-solid-svg-icons/faCircleMinus'
  import { faCirclePlus } from '@fortawesome/free-solid-svg-icons/faCirclePlus'
  import { cloneDeep, debounce } from 'lodash-es'

  import type { IntervalLegendColorMapRow } from '$lib/types'

  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    LayerInitialValues,
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MINIMUM,
    COLOR_CLASS_COUNT_MAXIMUM,
  } from '$lib/constants'
  import { updateParamsInURL } from '$lib/helper'
  import type { Layer, LayerInfo } from '$lib/types'
  import { map } from '$stores'
  import IntervalsLegendColorMapRow from './IntervalsLegendColorMapRow.svelte'

  export let layerConfig: Layer = LayerInitialValues
  export let numberOfClasses = layerConfig.intervals.numberOfClasses || COLOR_CLASS_COUNT

  let definition:
    | RasterLayerSpecification
    | FillLayerSpecification
    | LineLayerSpecification
    | SymbolLayerSpecification
    | HeatmapLayerSpecification
  let info: LayerInfo
  ;({ definition, info } = layerConfig)

  const layerMax = Number(info.band_metadata[0][1]['STATISTICS_MAXIMUM'])
  const layerMin = Number(info.band_metadata[0][1]['STATISTICS_MINIMUM'])
  const layerSrc = $map.getSource(definition.source)
  const layerURL = new URL(layerSrc.tiles[0])

  let classificationMethod = layerConfig.intervals.classification || ClassificationMethodTypes.EQUIDISTANT
  let cmap = layerConfig.intervals.colorMapRows
  let colorMapName = layerConfig.colorMapName
  export let colorPickerVisibleIndex: number
  let rangeSliderValues = [layerMin, layerMax]

  let classificationMethods = [
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]

  $: {
    if (layerConfig && colorMapName !== layerConfig.colorMapName) {
      colorMapName = layerConfig.colorMapName
      cmap = layerConfig.intervals.colorMapRows
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

    const intervalList = chroma.limits(rangeSliderValues, classificationMethod, numberOfClasses).map((element) => {
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
    cmap = layerConfig.intervals.colorMapRows
    handleParamsUpdate()
  }

  // encode colormap and update url parameters
  const handleParamsUpdate = debounce(() => {
    const encodeColorMapRows = JSON.stringify(
      layerConfig.intervals.colorMapRows.map((row) => [[row.start, row.end], row.color]),
    )
    layerURL.searchParams.delete('colormap_name')
    layerURL.searchParams.delete('rescale')
    let updatedParams = Object.assign({ colormap: encodeColorMapRows })
    updateParamsInURL(definition, layerURL, updatedParams)
  }, 500)

  const handleIncrementDecrementClasses = (operation: string) => {
    if (operation === '+') {
      if (numberOfClasses < COLOR_CLASS_COUNT_MAXIMUM) {
        numberOfClasses++
      }
    }
    if (operation === '-') {
      if (numberOfClasses > COLOR_CLASS_COUNT_MINIMUM) {
        numberOfClasses--
      }
    }

    const layerConfigClone = cloneDeep(layerConfig)
    layerConfigClone.intervals.numberOfClasses = numberOfClasses
    layerConfig = layerConfigClone
    reclassifyImage()
  }

  const handleColorPickerClick = (event: CustomEvent) => {
    colorPickerVisibleIndex = event.detail.index
  }
</script>

<div class="intervals-view-container" data-testid="intervals-view-container">
  <div class="columns is-gapless controls" on:click={() => (colorPickerVisibleIndex = -1)}>
    <div class="column classification">
      <div class="is-size-6 is-flex is-justify-content-center" style="margin-bottom: 5px;">Classification</div>
      <div class="select is-rounded is-flex is-justify-content-center" style="height: 30px;">
        <select bind:value={classificationMethod} on:change={(e) => reclassifyImage(e)} style="width: 114px;">
          {#each classificationMethods as classificationMethod}
            <option class="legend-text" value={classificationMethod.code}>{classificationMethod.name}</option>
          {/each}
        </select>
      </div>
    </div>
    <div class="column number-classes">
      <div class="is-size-6 is-flex is-justify-content-center">Number of Classess</div>
      <div class="container is-flex is-justify-content-center">
        <div class="row">
          <div
            class={`minus ${numberOfClasses === COLOR_CLASS_COUNT_MINIMUM ? 'disabled' : ''}`}
            on:click={() => handleIncrementDecrementClasses('-')}
            alt="Decrease number of classes"
            title="Decrease number of classes">
            <Fa icon={faCircleMinus} />
          </div>
          <div class="tag is-info is-light is-medium">
            {numberOfClasses}
          </div>
          <div
            class={`plus ${numberOfClasses === COLOR_CLASS_COUNT_MAXIMUM ? 'disabled' : ''}`}
            on:click={() => handleIncrementDecrementClasses('+')}
            alt="Increase number of classes"
            title="Increase number of classes">
            <Fa icon={faCirclePlus} />
          </div>
        </div>
      </div>
    </div>
  </div>

  {#each cmap as colorMapRow}
    <IntervalsLegendColorMapRow
      bind:colorMapRow
      {colorPickerVisibleIndex}
      on:clickColorPicker={handleColorPickerClick}
      on:changeIntervalValues={handleParamsUpdate} />
  {/each}
</div>

<style lang="scss">
  .intervals-view-container {
    .controls {
      margin-bottom: 10px !important;

      .number-classes {
        .container {
          display: flex;
          height: 40px;
          justify-content: center;

          .row {
            display: flex;
            align-items: center;

            .minus,
            .plus {
              cursor: pointer;
            }

            .disabled {
              cursor: default;
              opacity: 0.1;
            }

            .tag {
              -moz-user-select: none;
              -ms-user-select: none;
              -webkit-user-select: none;
              margin-left: 10px;
              margin-right: 10px;
              user-select: none;
            }
          }
        }
      }
    }
  }
</style>
