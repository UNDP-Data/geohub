<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'
  import { debounce } from 'lodash-es'

  import UniqueValuesLegendColorMapRow from '$components/controls/UniqueValuesLegendColorMapRow.svelte'
  import IntervalsLegendColorMapRow from '$components/controls/IntervalsLegendColorMapRow.svelte'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
    NO_RANDOM_SAMPLING_POINTS,
  } from '$lib/constants'
  import type {
    IntervalLegendColorMapRow,
    Layer,
    VectorLayerTileStatAttribute,
    VectorLayerTileStatLayer,
    VectorTileMetadata,
  } from '$lib/types'
  import { map } from '$stores'
  import {
    getIntervalList,
    getLayerProperties,
    getLayerStyle,
    getSampleFromInterval,
    remapInputValue,
  } from '$lib/helper'
  import PropertySelect from './vector-styles/PropertySelect.svelte'
  import { getMaxValueOfCharsInIntervals } from '$lib/helper/getMaxValueOfCharsInIntervals'

  export let layer: Layer
  export let layerMax: number
  export let layerMin: number
  export let colorMapName

  const classificationMethodsDefault = [
    { name: 'Natural Breaks', code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]

  export let classificationMethod: ClassificationMethodTypes
  let classificationMethods = classificationMethodsDefault
  let colorPickerVisibleIndex: number
  export let defaultFillOutlineColor: string = undefined
  let hasUniqueValues = false
  export let numberOfClasses = COLOR_CLASS_COUNT
  let propertySelectValue: string
  let inLegend = true
  let colorMapRows: IntervalLegendColorMapRow[] = []
  let rowWidth: number
  // update color intervals upon change of color map name\

  $: colorMapName, setIntervalValues()

  onMount(() => {
    getPropertySelectValue()
    getColorMapRows()
    setIntervalValues()
    $map.on('zoom', updateMap)
  })

  onDestroy(() => {
    if (!$map) return
    $map.off('zoom', updateMap)
  })

  const getPropertySelectValue = () => {
    const vectorLayerMeta = getLayerProperties($map, layer)
    const selectOptions = Object.keys(vectorLayerMeta.fields)

    propertySelectValue = selectOptions[0]

    const fillColorValue = $map.getPaintProperty(layer.id, 'fill-color')
    if (fillColorValue && Object.prototype.hasOwnProperty.call(fillColorValue, 'property')) {
      propertySelectValue = fillColorValue['property']
    }
  }

  const getColorMapRows = () => {
    const fillColorValue = $map.getPaintProperty(layer.id, 'fill-color')
    colorMapRows = []
    if (fillColorValue && Object.prototype.hasOwnProperty.call(fillColorValue, 'stops')) {
      const stats = (layer.info as VectorTileMetadata).json.tilestats?.layers.find(
        (l) => l.layer === getLayerStyle($map, layer.id)['source-layer'],
      )
      const stat = stats?.attributes.find((val) => val.attribute === propertySelectValue)

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const stops: [[number, string]] = fillColorValue.stops
      stops?.forEach((stop, index: number) => {
        const value: number = stop[0]
        const color: string = stop[1]

        colorMapRows.push({
          color: chroma(color).rgba(),
          index: index,
          start: value,
          end: stat.values ? '' : index < stops.length - 1 ? stops[index + 1][0] : layerMax,
        })
      })
    }
    numberOfClasses = colorMapRows.length === 0 ? COLOR_CLASS_COUNT : colorMapRows.length
  }

  const setDefaultProperty = (selectOptions: string[]) => {
    if (selectOptions.length === 0) return ''
    setIntervalValues()
    return propertySelectValue
  }

  const handlePropertyChange = (e) => {
    propertySelectValue = e.detail.prop
    setIntervalValues()
  }

  const handleClassificationChange = () => {
    // fire event for style sharing
    $map?.fire('classification:changed', {
      layerId: layer.id,
      classification: classificationMethod,
    })
    setIntervalValues()
  }

  const handleIncrementDecrementClasses = () => {
    setIntervalValues()
  }

  const handleParamsUpdate = debounce(() => {
    updateMap()
  }, 500)

  const handleColorPickerClick = (event: CustomEvent) => {
    colorPickerVisibleIndex = event.detail.index
  }

  const handleChangeIntervalValues = (event: CustomEvent) => {
    // get all values

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
        (tileLayer: VectorLayerTileStatLayer) => tileLayer.layer == getLayerStyle($map, layer.id)['source-layer'],
      )

      if (tileStatLayer) {
        const tileStatLayerAttribute = tileStatLayer.attributes.find(
          (val: VectorLayerTileStatAttribute) => val.attribute === propertySelectValue,
        )
        if (tileStatLayerAttribute) {
          const stats = (layer.info as VectorTileMetadata).json.tilestats?.layers.find(
            (l) => l.layer === getLayerStyle($map, layer.id)['source-layer'],
          )
          const stat = stats?.attributes.find((val) => val.attribute === tileStatLayerAttribute.attribute)
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
              const scaleColorList = chroma.scale(colorMapName).classes(intervalList)

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

            colorMapRows = propertySelectValues
            rowWidth = getMaxValueOfCharsInIntervals(colorMapRows)
            updateMap()
          }
        }
      }
    }
  }

  const updateMap = () => {
    const stops = colorMapRows.map((row, index) => {
      const rgb = `rgba(${row.color[0]}, ${row.color[1]}, ${row.color[2]}, ${remapInputValue(
        row.color[3],
        0,
        255,
        0,
        1,
      )})`
      const hex = chroma([row.color[0], row.color[1], row.color[2]]).hex()

      // set default line color to be middle of colors
      if (index === Math.floor(colorMapRows.length / 2)) {
        defaultFillOutlineColor = chroma(hex).darken(2.6).hex()
      }

      return [row.start, rgb]
    })
    // console.log(stops)
    $map.setPaintProperty(layer.id, 'fill-outline-color', defaultFillOutlineColor)
    $map.setPaintProperty(layer.id, 'fill-color', {
      property: propertySelectValue,
      type: 'interval',
      stops: stops,
    })
  }
</script>

<div
  class="polygon-advanced-container"
  data-testid="polygon-advanced-container">
  <div
    class="columns"
    style="display:flex; align-items: center">
    <div style="width: 50%; padding: 5%">
      <div class="has-text-centered pb-2">Property:</div>
      <PropertySelect
        bind:inLegend
        bind:propertySelectValue
        on:select={handlePropertyChange}
        {layer}
        showOnlyNumberFields={true}
        {setDefaultProperty} />
    </div>
    {#if hasUniqueValues === false}
      <div
        class="column"
        transition:fade>
        <div class="has-text-centered pb-2">Classification:</div>
        <div class="is-flex is-justify-content-center">
          <div class="select is-normal is-justify-content-center">
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

  <div
    class="is-divider separator mb-3 mt-0"
    data-content={hasUniqueValues ? 'Unique Values' : ''} />

  {#if hasUniqueValues === false}
    <div
      class="columns"
      style="margin-right: -56px;"
      transition:fade>
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
  <div
    class="columns"
    style="margin-right: -56px;">
    <div class="column size">
      <div>
        {#each colorMapRows as colorMapRow}
          {#if hasUniqueValues}
            <div class="pl-6">
              <UniqueValuesLegendColorMapRow
                bind:colorMapRow
                bind:colorMapName
                {layer}
                {colorPickerVisibleIndex}
                on:clickColorPicker={handleColorPickerClick}
                on:changeColorMap={handleParamsUpdate}
                on:changeIntervalValues={handleChangeIntervalValues} />
            </div>
          {:else}
            <IntervalsLegendColorMapRow
              bind:colorMapRow
              bind:colorMapName
              bind:rowWidth
              {layer}
              {colorPickerVisibleIndex}
              on:clickColorPicker={handleColorPickerClick}
              on:changeColorMap={handleParamsUpdate}
              on:closeColorPicker={() => (colorPickerVisibleIndex = -1)}
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
