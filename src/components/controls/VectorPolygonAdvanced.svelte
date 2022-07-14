<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'
  import { debounce } from 'lodash-es'

  import UniqueValuesLegendColorMapRow from '$components/UniqueValuesLegendColorMapRow.svelte'
  import IntervalsLegendColorMapRow from '$components/IntervalsLegendColorMapRow.svelte'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
    DEFAULT_LINE_COLOR,
    LayerInitialValues,
    NO_RANDOM_SAMPLING_POINTS,
  } from '$lib/constants'
  import type {
    IntervalLegendColorMapRow,
    Layer,
    VectorLayerTileStatAttribute,
    VectorLayerTileStatLayer,
  } from '$lib/types'
  import { map } from '$stores'
  import { getIntervalList, getSampleFromInterval } from '../../lib/helper'
  import PropertySelect from './vector-styles/PropertySelect.svelte'

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
  let hasUniqueValues = false
  let numberOfClasses = layer.intervals.numberOfClasses
  let propertySelectValue: string = null
  let zoomLevel: number

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
    propertySelectValue = layer.intervals.propertyName === '' ? '' : layer.intervals.propertyName
    layer.intervals.propertyName = propertySelectValue
    setIntervalValues()
  })

  const handlePropertyChange = (e) => {
    propertySelectValue = e.detail.prop
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
        if (tileStatLayerAttribute) {
          const stats = layer.info.stats as VectorLayerTileStatAttribute[]
          const stat = stats.find((val) => val.attribute === tileStatLayerAttribute.attribute)
          hasUniqueValues = false

          if (stat) {
            const propertySelectValues = []

            if (stat['values'] !== undefined) {
              hasUniqueValues = true

              const scaleColorList = chroma
                .scale(colorMapName)
                .mode('lrgb')
                .padding([0.25, 0])
                .domain([0, stat.values.length])

              for (let i = 0; i < stat.values.length; i++) {
                const row: IntervalLegendColorMapRow = {
                  index: i,
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore:next-line
                  color: [...scaleColorList(i).rgb(), 255],
                  start: stat.values[i],
                  end: '',
                }
                propertySelectValues.push(row)
              }
            } else {
              if (stat.min > 0) {
                classificationMethods = [
                  ...classificationMethods,
                  ...[{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC }],
                ]
              }

              const randomSample = getSampleFromInterval(stat.min, stat.max, NO_RANDOM_SAMPLING_POINTS)
              const intervalList = getIntervalList(
                classificationMethod,
                stat.min,
                stat.max,
                randomSample,
                numberOfClasses,
              )
              const scaleColorList = chroma.scale(layer.colorMapName).classes(intervalList)

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
            }

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

<div class="polygon-advanced-container" data-testid="polygon-advanced-container">
  <div class="columns">
    <div style="width: 50%; padding: 5%">
      <div class="has-text-centered pb-2">Property:</div>
      <PropertySelect bind:propertySelectValue on:select={handlePropertyChange} {layer} showOnlyNumberFields={true} />
    </div>
    {#if hasUniqueValues === false}
      <div class="column" transition:fade>
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
                <option
                  class="legend-text"
                  alt="Classification Method"
                  title="Classification Method"
                  value={classificationMethod.code}>{classificationMethod.name}</option>
              {/each}
            </select>
          </div>
        </div>
      </div>
    {:else}
      <div class="column" />
    {/if}
  </div>

  <div class="is-divider separator mb-3 mt-0" />

  {#if hasUniqueValues === false}
    <div class="columns" style="margin-right: -56px;" transition:fade>
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
  {/if}

  <div class="columns" style="margin-right: -56px;">
    <div class="column size">
      <div>
        {#each layer.intervals.colorMapRows as colorMapRow}
          {#if hasUniqueValues}
            <div class="pl-6">
              <UniqueValuesLegendColorMapRow
                bind:colorMapRow
                {layer}
                {colorPickerVisibleIndex}
                on:clickColorPicker={handleColorPickerClick}
                on:changeColorMap={handleParamsUpdate}
                on:changeIntervalValues={handleChangeIntervalValues} />
            </div>
          {:else}
            <IntervalsLegendColorMapRow
              bind:colorMapRow
              {layer}
              {colorPickerVisibleIndex}
              on:clickColorPicker={handleColorPickerClick}
              on:changeColorMap={handleParamsUpdate}
              on:changeIntervalValues={handleChangeIntervalValues} />
          {/if}
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
