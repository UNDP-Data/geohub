<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import { Jenks } from '$lib/jenks'
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
  } from '$lib/constants'
  import type {
    IntervalLegendColorMapRow,
    Layer,
    VectorLayerMetadata,
    VectorLayerTileStatAttribute,
    VectorLayerTileStatLayer,
  } from '$lib/types'
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
  let defaultLineColor = DEFAULT_LINE_COLOR
  let numberOfClasses = layer.intervals.numberOfClasses
  let propertySelectOptions: string[] = []
  let propertySelectValue: string = null
  let vectorLayerMeta: VectorLayerMetadata
  let zoomLevel: number

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

  // update map upon change of zoom level
  $: if (zoomLevel !== layer.zoomLevel) updateMap()

  onMount(() => {
    // set the zoom level to the initial value
    zoomLevel = $map.getZoom()
    layer.zoomLevel = zoomLevel
    $map.on('zoom', () => (zoomLevel = $map.getZoom()))

    setPropertySelectOptions()
    setIntervalValues()
  })

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

        if (tileStatLayerAttribute && tileStatLayerAttribute.type === 'number') {
          const values = tileStatLayerAttribute.values

          if (values.length > 0) {
            // add log classification method if min value greater than zero
            if (Math.min.apply(null, values) > 0) {
              classificationMethods = [
                ...classificationMethods,
                ...[{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC }],
              ]
            }

            let intervalList = []

            // get interval list based on classification method
            if (classificationMethod === ClassificationMethodTypes.NATURAL_BREAK) {
              intervalList = new Jenks(values, numberOfClasses).naturalBreak()
            } else {
              intervalList = chroma
                .limits(
                  [Math.min.apply(null, values), Math.max.apply(null, values)],
                  classificationMethod,
                  numberOfClasses,
                )
                .map((element) => {
                  return Number(element.toFixed(2))
                })
            }

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
            layerMax = Math.max.apply(null, values)
            layerMin = Math.min.apply(null, values)
            layer.intervals.colorMapRows = propertySelectValues

            updateMap()
          }
        }
      }
    }
  }

  const updateMap = () => {
    const stops = layer.intervals.colorMapRows.map((row, index) => {
      const rgb = chroma([row.color[0], row.color[1], row.color[2]]).hex('rgb')

      // set default line color to be middle of colors
      if (index === Math.floor(layer.intervals.colorMapRows.length / 2)) {
        defaultLineColor = rgb
      }

      return [row.start, rgb]
    })

    $map.setPaintProperty(layer.definition.id, 'fill-outline-color', defaultLineColor)
    $map.setPaintProperty(layer.definition.id, 'fill-color', {
      property: layer.intervals.propertyName,
      type: 'interval',
      stops: stops,
    })
  }
</script>

<div class="polygon-advanced-container">
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
  </div>

  <div class="is-divider separator mb-3 mt-0" />

  <div class="columns" style="margin-right: -56px;">
    <div class="column pb-0">
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

  .polygon-advanced-container {
    .size {
      padding-left: 15px;
    }
  }
</style>
