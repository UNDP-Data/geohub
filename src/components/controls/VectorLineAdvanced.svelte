<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import chroma from 'chroma-js'
  import { debounce } from 'lodash-es'

  import UniqueValuesLegendColorMapRow from '$components/controls/UniqueValuesLegendColorMapRow.svelte'
  import IntervalsLegendColorMapRow from '$components/controls/IntervalsLegendColorMapRow.svelte'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
    DEFAULT_LINE_COLOR,
    LayerInitialValues,
    NO_RANDOM_SAMPLING_POINTS,
    VectorLayerLineLegendApplyToTypes,
  } from '$lib/constants'
  import { getIntervalList, getLineColor, getLineWidth, getSampleFromInterval, remapInputValue } from '$lib/helper'
  import type {
    IntervalLegendColorMapRow,
    Layer,
    VectorLayerTileStatAttribute,
    VectorLayerTileStatLayer,
  } from '$lib/types'
  import { map } from '$stores'
  import PropertySelect from './vector-styles/PropertySelect.svelte'

  export let applyToOption: string
  export let layer: Layer = LayerInitialValues
  export let layerMax: number
  export let layerMin: number

  const classificationMethodsDefault = [
    // { name: 'Natural Breaks', code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]

  let classificationMethod
  let classificationMethods = classificationMethodsDefault
  let colorMapName = layer.colorMapName
  let colorPickerVisibleIndex: number
  let cssIconFilter: string
  let hasUniqueValues = false
  let numberOfClasses = layer.intervals.numberOfClasses
  let propertySelectValue: string = null
  let zoomLevel: number
  let sizeArray: number[]
  let highlySkewed: boolean
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
    if (highlySkewed) {
      classificationMethods = [
        ...classificationMethods,
        ...[{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC }],
      ]
      classificationMethod = ClassificationMethodTypes.LOGARITHMIC
    } else {
      classificationMethod = ClassificationMethodTypes.EQUIDISTANT
    }
  })

  const setCssIconFilter = () => {
    const lineColor = getLineColor($map, layer.definition.id)
    const rgba = chroma(lineColor).rgba()
    cssIconFilter = chroma([rgba[0], rgba[1], rgba[2]]).hex()
  }

  const setDefaultProperty = (selectOptions: string[]) => {
    if (selectOptions.length === 0) return ''
    const defaultValue = layer.intervals.propertyName === '' ? selectOptions[0] : layer.intervals.propertyName
    layer.intervals.propertyName = defaultValue
    setIntervalValues()
    return defaultValue
  }

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
    const stops = layer.intervals.colorMapRows.map((row) => {
      return [
        row.start,
        hasUniqueValues === true || layer.intervals.applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR
          ? chroma([row.color[0], row.color[1], row.color[2]]).hex('rgb')
          : remapInputValue(Number(row.end), layerMin, layerMax, 0.5, 10),
      ]
    })

    if (stops.length > 0) {
      if (hasUniqueValues === true || layer.intervals.applyToOption === VectorLayerLineLegendApplyToTypes.LINE_COLOR) {
        $map.setPaintProperty(layer.definition.id, 'line-width', getLineWidth($map, layer.definition.id))
        $map.setPaintProperty(layer.definition.id, 'line-color', {
          property: layer.intervals.propertyName,
          type: 'interval',
          stops,
        })
      } else if (layer.intervals.applyToOption === VectorLayerLineLegendApplyToTypes.LINE_WIDTH) {
        // generate remapped stops based on the zoom level
        if (zoomLevel === undefined) {
          zoomLevel = $map.getZoom()
        }

        const newStops = stops.map((item) => [item[0] as number, (item[1] as number) / zoomLevel])

        sizeArray = newStops.map((item) => item[1])
        const lineColor = getLineColor($map, layer.definition.id)
        $map.setPaintProperty(layer.definition.id, 'line-color', lineColor ? lineColor : DEFAULT_LINE_COLOR)
        $map.setPaintProperty(layer.definition.id, 'line-width', {
          property: layer.intervals.propertyName,
          type: 'interval',
          stops: newStops,
        })
      }
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

  const handleApplyToClick = (type: string) => {
    applyToOption = type
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
            {#each Object.values(VectorLayerLineLegendApplyToTypes) as optionApplyTo}
              <div class="columns is-gapless mb-1">
                <div class="column is-2">
                  <input
                    type="radio"
                    name="layer-type"
                    bind:group={applyToOption}
                    value={optionApplyTo}
                    alt="Apply To Option"
                    title="Apply To Option" />
                </div>
                <div
                  class="column ml-2 applyto-title"
                  style="position: relative; top: -2px;"
                  on:click={() => handleApplyToClick(optionApplyTo)}>
                  {optionApplyTo}
                </div>
              </div>
            {/each}
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
          {#each layer.intervals.colorMapRows as colorMapRow}
            <div class="pl-6">
              <UniqueValuesLegendColorMapRow
                bind:colorMapRow
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
              {#each layer.intervals.colorMapRows as row, index}
                <tr data-testid="line-width-row-container">
                  <td class="has-text-centered">
                    <div style={`width: 100px; height: ${sizeArray[index]}px; background-color: ${cssIconFilter};`} />
                  </td>
                  <td>{row.start}</td>
                  <td>{row.end}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  @import '../../styles/undp-design/radio.min';

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
