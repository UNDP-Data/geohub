<script lang="ts">
  import { onDestroy, onMount } from 'svelte'
  import chroma from 'chroma-js'
  import { debounce } from 'lodash-es'
  import type { LayerSpecification } from 'maplibre-gl'
  import { hexToCSSFilter } from 'hex-to-css-filter'

  import IntervalsLegendColorMapRow from '$components/controls/IntervalsLegendColorMapRow.svelte'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
    NO_RANDOM_SAMPLING_POINTS,
    UNIQUE_VALUE_THRESHOLD,
    VectorApplyToTypes,
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
    SpriteImage,
    VectorLayerTileStatAttribute,
    VectorLayerTileStatLayer,
    VectorTileMetadata,
  } from '$lib/types'
  import { map, spriteImageList } from '$stores'
  import PropertySelect from './vector-styles/PropertySelect.svelte'
  import { Radios } from '@undp-data/svelte-undp-design'
  import type { Radio } from '@undp-data/svelte-undp-design/package/interfaces'
  import { getMaxValueOfCharsInIntervals } from '$lib/helper/getMaxValueOfCharsInIntervals'
  import { updateIntervalValues } from '$lib/helper/updateIntervalValues'

  export let applyToOption: VectorApplyToTypes
  export let layer: Layer
  export let layerMax: number
  export let layerMin: number
  export let colorMapName: string
  export let defaultColor: string
  export let propertySelectValue
  export let numberOfClasses: number
  export let colorMapRows: IntervalLegendColorMapRow[]
  export let defaultOutlineColor: string
  export let classificationMethod: ClassificationMethodTypes

  // update layer store upon change of apply to option
  $: applyToOption, updateMap()
  // update color intervals upon change of color map name
  $: colorMapName, updateMapWithNewColorMap()

  let classificationMethods = classificationMethodsDefault
  let colorPickerVisibleIndex: number
  let layerStyle = getLayerStyle($map, layer.id)
  let layerType = layerStyle.type
  let cssIconFilter: string
  let icon: SpriteImage
  let rowWidth: number
  let sizeArray: number[]
  let highlySkewed: boolean
  let hasUniqueValues = false
  let classificationMethodsDefault = [
    { name: 'Natural Breaks', code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]
  let applyToOptions: Radio[] = [
    {
      label: layerType === 'symbol' ? 'Icon color' : 'Line color',
      value: VectorApplyToTypes.COLOR,
    },
    {
      label: layerType === 'symbol' ? 'Icon size' : 'Line width',
      value: VectorApplyToTypes.SIZE,
    },
  ]

  onMount(() => {
    if (layerType === 'symbol') {
      icon = $spriteImageList.find((icon) => icon.alt === getIconImageName())
    }
    getPropertySelectValue()
    setCssIconFilter()
    getColorMapRows()
    setIntervalValues()

    if (layerType === 'line') {
      if (highlySkewed) {
        classificationMethods = [
          ...classificationMethods,
          ...[{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC }],
        ]
        classificationMethod = ClassificationMethodTypes.LOGARITHMIC
      } else {
        classificationMethod = ClassificationMethodTypes.EQUIDISTANT
      }
    }
    if (!$map) return
    $map.on('zoom', updateMap)
  })

  onDestroy(() => {
    if (!$map) return
    $map.off('zoom', updateMap)
  })

  const updateMapWithNewColorMap = () => {
    // generate new colors depending on the color map name and number of classes
    const colors = chroma.scale(colorMapName).colors(numberOfClasses)
    // update color intervals
    colorMapRows = colorMapRows.map((row, index) => {
      return {
        ...row,
        color: [
          chroma(colors[index]).rgba()[0],
          chroma(colors[index]).rgba()[1],
          chroma(colors[index]).rgba()[2],
          remapInputValue(chroma(colors[index]).alpha(), 0, 1, 0, 255),
        ],
      }
    })
    updateMap()
  }

  const setCssIconFilter = () => {
    if (layerType === 'fill') return
    const rgba = chroma(defaultColor).rgba()
    cssIconFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex()).filter
  }

  const getIconImageName = () => {
    const propertyName = 'icon-image'
    const style = $map.getStyle().layers.filter((mapLayer: LayerSpecification) => mapLayer.id === layer.id)[0]
    return style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle'
  }

  const getPropertySelectValue = () => {
    const vectorLayerMeta = getLayerProperties($map, layer)
    const selectOptions = Object.keys(vectorLayerMeta.fields)

    propertySelectValue = selectOptions[0]

    if (layerType === 'fill') {
      const fillColorValue = $map.getPaintProperty(layer.id, 'fill-color')
      if (fillColorValue && Object.prototype.hasOwnProperty.call(fillColorValue, 'property')) {
        propertySelectValue = fillColorValue['property']
      }
    } else {
      if (applyToOption === VectorApplyToTypes.COLOR) {
        const propertyName = layerType === 'symbol' ? 'icon-color' : 'line-color'
        const colorValue = $map.getPaintProperty(layer.id, propertyName)
        if (colorValue && Object.prototype.hasOwnProperty.call(colorValue, 'property')) {
          propertySelectValue = colorValue['property']
        }
      } else {
        const propertyName = layerType === 'symbol' ? 'icon-size' : 'line-width'
        const sizeValue =
          layerType === 'symbol'
            ? $map.getLayoutProperty(layer.id, propertyName)
            : $map.getPaintProperty(layer.id, propertyName)
        if (sizeValue && Object.prototype.hasOwnProperty.call(sizeValue, 'property')) {
          propertySelectValue = sizeValue['property']
        }
      }
    }
  }

  const getColorMapRows = () => {
    let stops: [[number, string]]
    if (layerType === 'fill') {
      const colorValue = $map.getPaintProperty(layer.id, 'fill-color')
      if (colorValue && Object.prototype.hasOwnProperty.call(colorValue, 'stops')) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        stops = colorValue.stops
      }
    } else {
      if (applyToOption === VectorApplyToTypes.COLOR) {
        const propertyName = layerType === 'symbol' ? 'icon-color' : 'line-color'
        const colorValue = $map.getPaintProperty(layer.id, propertyName)
        if (colorValue && Object.prototype.hasOwnProperty.call(colorValue, 'stops')) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          stops = colorValue.stops
        }
      } else {
        const propertyName = layerType === 'symbol' ? 'icon-size' : 'line-width'
        const sizeValue =
          layerType === 'symbol'
            ? $map.getLayoutProperty(layer.id, propertyName)
            : $map.getPaintProperty(layer.id, propertyName)
        if (sizeValue && Object.prototype.hasOwnProperty.call(sizeValue, 'stops')) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          stops = sizeValue.stops
        }
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
    colorMapRows = updateIntervalValues(event, colorMapRows)
    rowWidth = getMaxValueOfCharsInIntervals(colorMapRows)
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
            layerMax = stat.max
            layerMin = stat.min

            const propertySelectValues = []
            const values = stat.values
            if (values && values.length <= UNIQUE_VALUE_THRESHOLD) {
              hasUniqueValues = true
              applyToOption = VectorApplyToTypes.COLOR

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
              if (layerType === 'symbol' && stat.min > 0) {
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
    if (!propertySelectValue) return
    if (layerType === 'fill') {
      let stops = colorMapRows.map((row, index) => {
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
          defaultOutlineColor = chroma(hex).darken(2.6).hex()
        }

        return [row.start, rgb]
      })
      stops = sortStops(stops)
      $map.setPaintProperty(layer.id, 'fill-outline-color', defaultOutlineColor)
      $map.setPaintProperty(layer.id, 'fill-color', {
        property: propertySelectValue,
        type: 'interval',
        stops: stops,
      })
    } else {
      let stops = colorMapRows.map((row) => {
        return [
          row.start,
          hasUniqueValues === true || applyToOption === VectorApplyToTypes.COLOR
            ? chroma([row.color[0], row.color[1], row.color[2]]).hex('rgb')
            : remapInputValue(Number(row.end), layerMin, layerMax, 0.5, 10),
        ]
      })

      if (stops.length > 0) {
        stops = sortStops(stops)
        if (hasUniqueValues === true || applyToOption === VectorApplyToTypes.COLOR) {
          if (layerType === 'symbol') {
            const iconSize = $map.getLayoutProperty(layer.id, 'icon-size')
            if (!iconSize || (iconSize && iconSize.type === 'interval')) {
              $map.setLayoutProperty(layer.id, 'icon-size', 1)
            }
            $map.setPaintProperty(layer.id, 'icon-color', {
              property: propertySelectValue,
              type: 'interval',
              stops: stops,
            })
          } else if (layerType === 'line') {
            $map.setPaintProperty(layer.id, 'line-width', getLineWidth($map, layer.id))
            $map.setPaintProperty(layer.id, 'line-color', {
              property: propertySelectValue,
              type: 'interval',
              stops,
            })
          }
        } else if (applyToOption === VectorApplyToTypes.SIZE) {
          // Generate new stops based on the zoomLevel
          if (layerType === 'symbol') {
            // Ends are the
            const intervalEnds = colorMapRows.map((item) => item.end)
            const ratioOfRadiustoTheFirstEnd = intervalEnds
              .slice(1)
              .map((item) => (item as number) / Number(intervalEnds[0]))

            // Add 1 to the ratio array
            ratioOfRadiustoTheFirstEnd.unshift(1)

            // newStops array, that takes into considerarion the ratio and the zoomLevel
            const newStops = stops.map((item, index) => {
              let ratio = 1
              if (ratioOfRadiustoTheFirstEnd[index]) {
                ratio = (ratioOfRadiustoTheFirstEnd[index] as number) * ($map.getZoom() / 10)
              }
              return [item[0], ratio]
            })
            $map.setPaintProperty(layer.id, 'icon-color', defaultColor)
            $map.setLayoutProperty(layer.id, 'icon-size', {
              property: propertySelectValue,
              type: 'interval',
              stops: newStops,
            })
          } else if (layerType === 'line') {
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
    }
  }

  const sortStops = (stops: (string | number)[][]) => {
    stops = stops.sort((first, second) => {
      if (first[0] > second[0]) {
        return 1
      } else if (first[0] < second[0]) {
        return -1
      } else {
        return 0
      }
    })
    return stops
  }
</script>

<div
  class="advanced-container"
  data-testid="advanced-container">
  <div class="columns is-mobile">
    <div class="column">
      <div class="has-text-centered pb-2">Property:</div>
      <PropertySelect
        bind:propertySelectValue
        on:select={handlePropertyChange}
        {layer}
        showOnlyNumberFields={true} />
    </div>
    {#if layerType !== 'fill' && hasUniqueValues === false}
      <div class="column">
        <div class="has-text-centered pb-2">Apply To</div>
        <div class="is-flex is-justify-content-center">
          <Radios
            bind:radios={applyToOptions}
            bind:value={applyToOption}
            groupName="layer-type-{layer.id}}"
            isVertical={true} />
        </div>
      </div>
    {/if}
  </div>

  {#if hasUniqueValues === false}
    <div class="columns is-mobile">
      <div class="column">
        <div class="has-text-centered pb-2">Classification</div>
        <div class="select is-normal">
          <select
            bind:value={classificationMethod}
            on:change={handleClassificationChange}
            style="width: 110px;"
            title="Classification Methods">
            {#each classificationMethods as classificationMethod}
              <option
                class="legend-text"
                title="Classification Method"
                value={classificationMethod.code}>{classificationMethod.name}</option>
            {/each}
          </select>
        </div>
      </div>
      <div class="column">
        <div class="has-text-centered">Number of Classes</div>
        <NumberInput
          bind:value={numberOfClasses}
          minValue={COLOR_CLASS_COUNT_MINIMUM}
          maxValue={COLOR_CLASS_COUNT_MAXIMUM}
          on:change={handleIncrementDecrementClasses} />
      </div>
    </div>
  {/if}
  <div class="columns">
    <div class="column size">
      <div>
        {#if layerType === 'fill' || applyToOption === VectorApplyToTypes.COLOR}
          {#each colorMapRows as colorMapRow}
            <IntervalsLegendColorMapRow
              bind:colorMapRow
              bind:colorMapName
              bind:rowWidth
              {colorPickerVisibleIndex}
              on:clickColorPicker={handleColorPickerClick}
              on:changeColorMap={handleParamsUpdate}
              on:closeColorPicker={() => (colorPickerVisibleIndex = -1)}
              on:changeIntervalValues={handleChangeIntervalValues} />
          {/each}
        {:else if applyToOption === VectorApplyToTypes.SIZE}
          <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
            <thead>
              <tr>
                <th>{layerType === 'symbol' ? 'Icon' : 'Line'}</th>
                <th>Start</th>
                <th>End</th>
              </tr>
            </thead>
            <tbody>
              {#if layerType === 'symbol'}
                {#each colorMapRows as row, index}
                  {@const size = remapInputValue(Number(row.end), layerMin, layerMax, 10, 20)}
                  <tr data-testid="icon-size-row-container">
                    <td class="has-text-centered">
                      {#if icon}
                        <img
                          src={icon.src}
                          alt={icon.alt}
                          style={`width: ${size}px; height: ${size}px; filter: ${cssIconFilter}`} />
                      {/if}
                    </td>
                    <td>{row.start}</td>
                    <td>{row.end}</td>
                  </tr>
                {/each}
              {:else if layerType === 'line'}
                {#if sizeArray && sizeArray.length > 0}
                  {#each colorMapRows as row, index}
                    <tr data-testid="line-width-row-container">
                      <td class="has-text-centered">
                        <div
                          style={`margin-top: 5px; width: 100px; height: ${sizeArray[index]}px; background-color: ${defaultColor};`} />
                      </td>
                      <td>{row.start}</td>
                      <td>{row.end}</td>
                    </tr>
                  {/each}
                {/if}
              {/if}
            </tbody>
          </table>
        {/if}
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

  .advanced-container {
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
