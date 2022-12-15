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
    LayerInitialValues,
    NO_RANDOM_SAMPLING_POINTS,
    VectorLayerLineLegendApplyToTypes,
  } from '$lib/constants'
  import {
    getIntervalList,
    getLayerProperties,
    getLayerStyle,
    getLineWidth,
    getSampleFromInterval,
    remapInputValue,
  } from '$lib/helper'
  import type {
    IntervalLegendColorMapRow,
    Layer,
    VectorLayerTileStatAttribute,
    VectorLayerTileStatLayer,
    VectorTileMetadata,
  } from '$lib/types'
  import { map } from '$stores'
  import PropertySelect from './vector-styles/PropertySelect.svelte'
  import { Radios } from '@undp-data/svelte-undp-design'
  import type { Radio } from '@undp-data/svelte-undp-design/interfaces'

  export let applyToOption: string
  export let layer: Layer = LayerInitialValues
  export let layerMax: number
  export let layerMin: number
  export let colorMapName: string
  export let defaultColor: string = undefined

  const classificationMethodsDefault = [
    // { name: 'Natural Breaks', code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]

  export let classificationMethod: ClassificationMethodTypes
  let classificationMethods = classificationMethodsDefault
  let colorPickerVisibleIndex: number
  let cssIconFilter: string
  let hasUniqueValues = false
  export let numberOfClasses = COLOR_CLASS_COUNT
  let propertySelectValue: string = null
  let sizeArray: number[]
  let highlySkewed: boolean
  let colorMapRows: IntervalLegendColorMapRow[] = []
  // update layer store upon change of apply to option
  $: applyToOption, updateMap()

  let applyToOptions: Radio[] = [
    {
      label: VectorLayerLineLegendApplyToTypes.LINE_COLOR,
      value: VectorLayerLineLegendApplyToTypes.LINE_COLOR,
    },
    {
      label: VectorLayerLineLegendApplyToTypes.LINE_WIDTH,
      value: VectorLayerLineLegendApplyToTypes.LINE_WIDTH,
    },
  ]

  // update color intervals upon change of color map name
  $: colorMapName, colorMapChanged()
  const colorMapChanged = () => {
    getPropertySelectValue()
    getColorMapRows()
    setIntervalValues()
  }

  onMount(() => {
    getPropertySelectValue()
    getColorMapRows()
    setCssIconFilter()
    if (highlySkewed) {
      classificationMethods = [
        ...classificationMethods,
        ...[{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC }],
      ]
      classificationMethod = ClassificationMethodTypes.LOGARITHMIC
    } else {
      classificationMethod = ClassificationMethodTypes.EQUIDISTANT
    }
    if (!$map) return
    $map.on('zoom', updateMap)
  })

  onDestroy(() => {
    if (!$map) return
    $map.off('zoom', updateMap)
  })

  const setCssIconFilter = () => {
    const lineColor = defaultColor
    const rgba = chroma(lineColor).rgba()
    cssIconFilter = chroma([rgba[0], rgba[1], rgba[2]]).hex()
  }

  const getPropertySelectValue = () => {
    const vectorLayerMeta = getLayerProperties($map, layer)
    const selectOptions = Object.keys(vectorLayerMeta.fields)

    propertySelectValue = selectOptions[0]

    if (applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR) {
      const lineColorValue = $map.getPaintProperty(layer.id, 'line-color')
      if (lineColorValue && Object.prototype.hasOwnProperty.call(lineColorValue, 'property')) {
        propertySelectValue = lineColorValue['property']
      }
    } else {
      const lineWidthValue = $map.getPaintProperty(layer.id, 'line-width')
      if (lineWidthValue && Object.prototype.hasOwnProperty.call(lineWidthValue, 'property')) {
        propertySelectValue = lineWidthValue['property']
      }
    }
  }

  const getColorMapRows = () => {
    let stops: [[number, string]]
    if (applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR) {
      const lineColorValue = $map.getPaintProperty(layer.id, 'line-color')
      if (lineColorValue && Object.prototype.hasOwnProperty.call(lineColorValue, 'stops')) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        stops = lineColorValue.stops
      }
    } else {
      const lineWidthValue = $map.getPaintProperty(layer.id, 'line-width')
      if (lineWidthValue && Object.prototype.hasOwnProperty.call(lineWidthValue, 'stops')) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        stops = lineWidthValue.stops
      }
    }
    colorMapRows = []

    const stats = (layer.info as VectorTileMetadata).json.tilestats?.layers.find(
      (l) => l.layer === getLayerStyle($map, layer.id)['source-layer'],
    )
    const stat = stats?.attributes.find((val) => val.attribute === propertySelectValue)

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
    const rowIndex = event.detail.index
    const inputType = event.detail.id
    const inputValue = event.detail.value

    if (inputType === 'start' && rowIndex !== 0) {
      colorMapRows[rowIndex - 1].end = inputValue
    }

    if (inputType === 'end' && rowIndex < colorMapRows.length - 1) {
      colorMapRows[rowIndex + 1].start = inputValue
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
          const skewness = 3 * ((stat['mean'] - stat['median']) / stat['std'])

          highlySkewed = !(skewness < 1 && skewness > -1)

          hasUniqueValues = false

          if (stat) {
            const propertySelectValues = []

            if (stat.values !== undefined) {
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
              // No unique values
              // if (stat.min > 0) {
              //   classificationMethods = [
              //     ...classificationMethods,
              //     ...[{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC }],
              //   ]
              // }

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

            updateMap()
          }
        }
      }
    }
  }

  const updateMap = () => {
    if (!propertySelectValue) return
    const stops = colorMapRows.map((row) => {
      return [
        row.start,
        hasUniqueValues === true || applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR
          ? chroma([row.color[0], row.color[1], row.color[2]]).hex('rgb')
          : remapInputValue(Number(row.end), layerMin, layerMax, 0.5, 10),
      ]
    })

    if (stops.length > 0) {
      if (hasUniqueValues === true || applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR) {
        $map.setPaintProperty(layer.id, 'line-width', getLineWidth($map, layer.id))
        $map.setPaintProperty(layer.id, 'line-color', {
          property: propertySelectValue,
          type: 'interval',
          stops,
        })
      } else if (applyToOption === VectorLayerLineLegendApplyToTypes.LINE_WIDTH) {
        // generate remapped stops based on the zoom level
        const newStops = stops.map((item) => [item[0] as number, (item[1] as number) / $map.getZoom()])

        sizeArray = newStops.map((item) => item[1])
        $map.setPaintProperty(layer.id, 'line-color', defaultColor)
        $map.setPaintProperty(layer.id, 'line-width', {
          property: propertySelectValue,
          type: 'interval',
          stops: newStops,
        })
      }
    }
  }
</script>

<div
  class="line-advanced-container"
  data-testid="line-advanced-container">
  <div class="columns">
    <div style="width: 50%; padding: 5%">
      <div class="has-text-centered pb-2">Property:</div>
      <PropertySelect
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
        <div class="has-text-centered pb-2">Apply To</div>
        <div class="is-flex is-justify-content-center">
          <div class="mb-0">
            <Radios
              bind:radios={applyToOptions}
              bind:value={applyToOption}
              groupName="layer-type-{layer.id}}"
              isVertical={true} />
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
      <div class="column">
        <div class="has-text-centered pb-2">Classification</div>
        <div class="is-flex is-justify-content-center">
          <div class="select is-justify-content-center is-small">
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
  {/if}

  <div
    class="columns"
    style="margin-right: -56px;">
    <div class="column size">
      {#if hasUniqueValues}
        <div>
          {#each colorMapRows as colorMapRow}
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
          {/each}
        </div>
      {:else}
        {#if applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR}
          <div>
            {#each colorMapRows as colorMapRow}
              <IntervalsLegendColorMapRow
                bind:colorMapRow
                bind:colorMapName
                {layer}
                {colorPickerVisibleIndex}
                on:clickColorPicker={handleColorPickerClick}
                on:changeColorMap={handleParamsUpdate}
                on:changeIntervalValues={handleChangeIntervalValues} />
            {/each}
          </div>
        {/if}

        {#if applyToOption === VectorLayerLineLegendApplyToTypes.LINE_WIDTH}
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th>Line</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {#if sizeArray && sizeArray.length > 0}
                {#each colorMapRows as row, index}
                  <tr data-testid="line-width-row-container">
                    <td class="has-text-centered">
                      <div style={`width: 100px; height: ${sizeArray[index]}px; background-color: ${cssIconFilter};`} />
                    </td>
                    <td>{row.start}</td>
                    <td>{row.end}</td>
                  </tr>
                {/each}
              {/if}
            </tbody>
          </table>
        {/if}
      {/if}
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

  .line-advanced-container {
    input[type='radio'] {
      cursor: pointer;
    }

    .size {
      padding-left: 15px;
    }

    .applyto-title {
      cursor: grab;
    }
  }
</style>
