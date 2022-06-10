<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import { debounce } from 'lodash-es'

  import IntervalsLegendColorMapRow from '$components/IntervalsLegendColorMapRow.svelte'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
    DEFAULT_LINE_COLOR,
    LayerInitialValues,
    VectorLayerLineLegendApplyToTypes,
  } from '$lib/constants'
  import { remapInputValue } from '$lib/helper'
  import type {
    IntervalLegendColorMapRow,
    Layer,
    VectorLayerMetadata,
    VectorLayerTileStatAttribute,
    VectorLayerTileStatLayer,
  } from '$lib/types'
  import IntervalListHelper from '$lib/intervalList'
  import { map } from '$stores'

  export let applyToOption: string
  export let layer: Layer = LayerInitialValues
  export let layerMax: number
  export let layerMin: number

  const classificationMethodsDefault = [
    { name: 'Natural Breaks', code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]

  let classificationMethod = layer.intervals.classification
  let classificationMethods = classificationMethodsDefault
  let colorMapName = layer.colorMapName
  let colorPickerVisibleIndex: number
  let cssIconFilter: string
  let numberOfClasses = layer.intervals.numberOfClasses
  let propertySelectOptions: string[] = []
  let propertySelectValue: string = null
  let vectorLayerMeta: VectorLayerMetadata
  let zoomLevel: number
  let sizeArray: number[]
  // update layer store upon change of apply to option
  $: if (applyToOption !== layer.intervals.applyToOption) {
    layer.intervals.applyToOption = applyToOption
    updateMap()
  }

  // update color intervals upon change of color map name
  $: {
    if (layer && colorMapName !== layer.colorMapName) {
      colorMapName = layer.colorMapName
      setIntervalValues()
    }
  }

  // Initially set the zoomLevel to the initial value
  onMount(() => {
    zoomLevel = $map.getZoom()
    layer.zoomLevel = zoomLevel
    setCssIconFilter()
    setPropertySelectOptions()
    setIntervalValues()
  })

  const setCssIconFilter = () => {
    const rgba = chroma(layer.iconColor ? layer.iconColor : DEFAULT_LINE_COLOR).rgba()
    cssIconFilter = chroma([rgba[0], rgba[1], rgba[2]]).hex()
  }

  const setPropertySelectOptions = () => {
    const metadata = layer.info
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    vectorLayerMeta = metadata.json.vector_layers.find((l) => l.id === layer.definition['source-layer'])
    Object.keys(vectorLayerMeta.fields).forEach((key) => {
      if (vectorLayerMeta.fields[key] !== 'Number') {
        delete vectorLayerMeta.fields[key]
      }
    })
    propertySelectOptions = Object.keys(vectorLayerMeta.fields)
    propertySelectValue = layer.intervals.propertyName === '' ? propertySelectOptions[0] : layer.intervals.propertyName
    layer.intervals.propertyName = propertySelectValue
  }

  const handlePropertyChange = () => {
    layer.intervals.propertyName = propertySelectValue
    setIntervalValues()
  }

  const handleClassificationChange = () => {
    layer.intervals.classification = classificationMethod
    setIntervalValues()
  }

  const handleIncrementDecrementClasses = () => {
    layer.intervals.numberOfClasses = numberOfClasses
    setIntervalValues()
  }

  const handleParamsUpdate = debounce(() => {
    updateMap()
  }, 500)

  const handleColorPickerClick = (event: CustomEvent) => {
    colorPickerVisibleIndex = event.detail.index
  }

  const handleChangeIntervalValues = (event: CustomEvent) => {
    const rowIndex = event.detail.index
    const inputType = event.detail.id
    const inputValue = event.detail.value

    if (inputType === 'start' && rowIndex !== 0) {
      layer.intervals.colorMapRows[rowIndex - 1].end = inputValue
    }

    if (inputType === 'end' && rowIndex < layer.intervals.colorMapRows.length - 1) {
      layer.intervals.colorMapRows[rowIndex + 1].start = inputValue
    }

    updateMap()
  }

  const setIntervalValues = () => {
    // set to default values
    classificationMethods = classificationMethodsDefault

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tilestats = layer?.info?.json?.tilestats
    if (tilestats) {
      const tileStatLayer = tilestats?.layers.find(
        (tileLayer: VectorLayerTileStatLayer) => tileLayer.layer == layer.definition['source-layer'],
      )

      if (tileStatLayer) {
        const tileStatLayerAttribute = tileStatLayer.attributes.find(
          (val: VectorLayerTileStatAttribute) => val.attribute === layer.intervals.propertyName,
        )
        const stats = layer.info.stats as VectorLayerTileStatAttribute[]
        const stat = stats.find((val) => val.attribute === tileStatLayerAttribute.attribute)

        if (stat) {
          if (stat.min > 0) {
            classificationMethods = [
              ...classificationMethods,
              ...[{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC }],
            ]
          }

          const intervalListHelper = new IntervalListHelper(stat.histogram.bins, stat.histogram.count)
          const randomSample = intervalListHelper.getRandomSample()
          const intervalList = intervalListHelper.getIntervalList(
            classificationMethod,
            stat.min,
            stat.max,
            randomSample,
            numberOfClasses,
          )
          const scaleColorList = chroma.scale(layer.colorMapName).classes(intervalList)
          const propertySelectValues = []

          // create interval list (start / end)
          for (let i = 0; i < intervalList.length - 1; i++) {
            const row: IntervalLegendColorMapRow = {
              index: i,
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore:next-line
              color: [...scaleColorList(intervalList[i]).rgb(), 255],
              start: intervalList[i],
              end: intervalList[i + 1],
            }
            propertySelectValues.push(row)
          }
          layerMax = stat.max
          layerMin = stat.min
          layer.intervals.colorMapRows = propertySelectValues

          updateMap()
        }
      }
    }
  }

  const updateMap = () => {
    const stops = layer.intervals.colorMapRows.map((row) => {
      return [
        row.start,
        layer.intervals.applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR
          ? chroma([row.color[0], row.color[1], row.color[2]]).hex('rgb')
          : remapInputValue(Number(row.end), layerMin, layerMax, 0.5, 10),
      ]
    })

    if (layer.intervals.applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR && stops.length > 0) {
      $map.setPaintProperty(layer.definition.id, 'line-width', 1)
      $map.setPaintProperty(layer.definition.id, 'line-color', {
        property: layer.intervals.propertyName,
        type: 'interval',
        stops: stops,
      })
    }

    if (layer.intervals.applyToOption === VectorLayerLineLegendApplyToTypes.LINE_WIDTH && stops.length > 0) {
      // generate remapped stops based on the zoom level
      if (zoomLevel === undefined) {
        zoomLevel = $map.getZoom()
      }

      const newStops = stops.map((item) => [item[0] as number, (item[1] as number) / zoomLevel])

      sizeArray = newStops.map((item) => item[1])
      $map.setPaintProperty(layer.definition.id, 'line-color', layer.iconColor ? layer.iconColor : DEFAULT_LINE_COLOR)
      $map.setPaintProperty(layer.definition.id, 'line-width', {
        property: layer.intervals.propertyName,
        type: 'interval',
        stops: newStops,
      })
    }
  }

  // If zoomLevel Changes, updateMap
  $: {
    if (zoomLevel !== layer.zoomLevel) {
      updateMap()
    }
  }

  // On Zoom change the zoomLevel variable
  $map.on('zoom', () => (zoomLevel = $map.getZoom()))
</script>

<div class="line-advanced-container">
  <div class="columns">
    <div class="column">
      <div class="has-text-centered pb-2">Property</div>
      <div class="is-flex is-justify-content-center">
        <div class="select is-rounded is-justify-content-center">
          <select
            bind:value={propertySelectValue}
            on:change={handlePropertyChange}
            style="width: 110px;"
            alt="Property Options"
            title="Property Options">
            {#each propertySelectOptions as propertySelectOption}
              <option class="legend-text" value={propertySelectOption}>{propertySelectOption}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
    <div class="column">
      <div class="has-text-centered pb-2">Apply To</div>
      <div class="is-flex is-justify-content-center">
        <div class="mb-0">
          {#each Object.values(VectorLayerLineLegendApplyToTypes) as optionApplyTo}
            <div class="columns is-gapless mb-1">
              <div class="column is-2">
                <input
                  type="radio"
                  name="layer-type"
                  bind:group={applyToOption}
                  value={optionApplyTo}
                  alt={`${optionApplyTo} Option`}
                  title={`${optionApplyTo} Option`} />
              </div>
              <div class="column ml-2" style="position: relative; top: -2px;">
                {optionApplyTo}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="is-divider separator mb-4" style="margin-right: -56px;" />

  <div class="columns" style="margin-right: -56px;">
    <div class="column">
      <div class="has-text-centered pb-2">Classification</div>
      <div class="is-flex is-justify-content-center">
        <div class="select is-rounded is-justify-content-center">
          <select
            bind:value={classificationMethod}
            on:change={handleClassificationChange}
            style="width: 110px;"
            alt="Classification Methods"
            title="Classification Methods">
            {#each classificationMethods as classificationMethod}
              <option class="legend-text" value={classificationMethod.code}>{classificationMethod.name}</option>
            {/each}
          </select>
        </div>
      </div>
    </div>
    <div class="column">
      <div class="has-text-centered">Number of Classes</div>
      <div class="is-flex is-justify-content-center">
        <NumberInput
          bind:value={numberOfClasses}
          minValue={COLOR_CLASS_COUNT_MINIMUM}
          maxValue={COLOR_CLASS_COUNT_MAXIMUM}
          on:change={handleIncrementDecrementClasses} />
      </div>
    </div>
  </div>

  <div class="columns" style="margin-right: -56px;">
    {#if applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR}
      <div class="column size">
        <div>
          {#each layer.intervals.colorMapRows as colorMapRow}
            <IntervalsLegendColorMapRow
              bind:colorMapRow
              {layer}
              {colorPickerVisibleIndex}
              on:clickColorPicker={handleColorPickerClick}
              on:changeColorMap={handleParamsUpdate}
              on:changeIntervalValues={handleChangeIntervalValues} />
          {/each}
        </div>
      </div>
    {/if}

    {#if applyToOption === VectorLayerLineLegendApplyToTypes.LINE_WIDTH}
      <div class="column size">
        <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>Line</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
            {#each layer.intervals.colorMapRows as row, index}
              <tr>
                <td class="has-text-centered">
                  <div style={`width: 100px; height: ${sizeArray[index]}px; background-color: ${cssIconFilter};`} />
                </td>
                <td>{row.start}</td>
                <td>{row.end}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  div {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }

  .line-advanced-container {
    input[type='radio'] {
      cursor: pointer;
    }

    .size {
      padding-left: 15px;
    }
  }
</style>
