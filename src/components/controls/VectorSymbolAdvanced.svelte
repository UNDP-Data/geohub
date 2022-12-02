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
    LayerInitialValues,
    NO_RANDOM_SAMPLING_POINTS,
    VectorLayerSymbolLegendApplyToTypes,
  } from '$lib/constants'
  import {
    getIntervalList,
    getLayerProperties,
    getLayerStyle,
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

  export let applyToOption: string
  export let layer: Layer = LayerInitialValues
  export let layerMax: number
  export let layerMin: number
  export let colorMapName: string
  export let defaultColor: string = undefined

  const classificationMethodsDefault = [
    { name: 'Natural Breaks', code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]
  let hasUniqueValues = false
  export let classificationMethod: ClassificationMethodTypes
  let classificationMethods = classificationMethodsDefault
  let colorPickerVisibleIndex: number
  let cssIconFilter: string
  let icon: SpriteImage
  export let numberOfClasses = COLOR_CLASS_COUNT
  let propertySelectValue: string = null
  let colorMapRows: IntervalLegendColorMapRow[] = []
  // update layer store upon change of apply to option
  $: applyToOption, updateMap()

  // update color intervals upon change of color map name
  $: colorMapName, colorMapChanged()
  const colorMapChanged = () => {
    getPropertySelectValue()
    getColorMapRows()
    setIntervalValues()
  }

  onMount(() => {
    icon = $spriteImageList.find((icon) => icon.alt === getIconImageName())
    setCssIconFilter()
    getPropertySelectValue()
    getColorMapRows()
    setIntervalValues()
    if (!$map) return
    $map.on('zoom', updateMap)
  })

  onDestroy(() => {
    if (!$map) return
    $map.off('zoom', updateMap)
  })

  const setCssIconFilter = () => {
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

    if (applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR) {
      const iconColorValue = $map.getPaintProperty(layer.id, 'icon-color')
      if (iconColorValue && Object.prototype.hasOwnProperty.call(iconColorValue, 'property')) {
        propertySelectValue = iconColorValue['property']
      }
    } else {
      const iconSizeValue = $map.getLayoutProperty(layer.id, 'icon-size')
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-igenore
      if (iconSizeValue && Object.prototype.hasOwnProperty.call(iconSizeValue, 'property')) {
        propertySelectValue = iconSizeValue['property']
      }
    }
  }

  const getColorMapRows = () => {
    let stops: [[number, string]]
    if (applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR) {
      const iconColorValue = $map.getPaintProperty(layer.id, 'icon-color')
      if (iconColorValue && Object.prototype.hasOwnProperty.call(iconColorValue, 'stops')) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        stops = iconColorValue.stops
      }
    } else {
      const iconSizeValue = $map.getLayoutProperty(layer.id, 'icon-size')
      if (iconSizeValue && Object.prototype.hasOwnProperty.call(iconSizeValue, 'stops')) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        stops = iconSizeValue.stops
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
        applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR
          ? chroma([row.color[0], row.color[1], row.color[2]]).hex('rgb')
          : remapInputValue(Number(row.end), layerMin, layerMax, 0.5, 10),
      ]
    })

    if (applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR && stops.length > 0) {
      const iconSize = $map.getLayoutProperty(layer.id, 'icon-size')
      if (!iconSize || (iconSize && iconSize.type === 'interval')) {
        $map.setLayoutProperty(layer.id, 'icon-size', 1)
      }
      $map.setPaintProperty(layer.id, 'icon-color', {
        property: propertySelectValue,
        type: 'interval',
        stops: stops,
      })
    }

    if (applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_SIZE && stops.length > 0) {
      // Generate new stops based on the zoomLevel

      // Ends are the
      const intervalEnds = colorMapRows.map((item) => item.end)
      const ratioOfRadiustoTheFirstEnd = intervalEnds.slice(1).map((item) => (item as number) / Number(intervalEnds[0]))

      // Add 1 to the ratio array
      ratioOfRadiustoTheFirstEnd.unshift(1)

      // newStops array, that takes into considerarion the ratio and the zoomLevel
      const newStops = stops.map((item, index) => [
        item[0],
        (ratioOfRadiustoTheFirstEnd[index] as number) * ($map.getZoom() / 10),
      ])

      $map.setPaintProperty(layer.id, 'icon-color', defaultColor)
      $map.setLayoutProperty(layer.id, 'icon-size', {
        property: propertySelectValue,
        type: 'interval',
        stops: newStops,
      })
    }
  }

  const handleApplyToClick = (type: string) => {
    applyToOption = type
  }
</script>

<div
  class="symbol-advanced-container"
  data-testid="symbol-advanced-container"
  style="">
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
    <div class="column">
      <div class="has-text-centered pb-2">Apply To</div>
      <div class="is-flex is-justify-content-center">
        <div class="mb-0">
          {#each Object.values(VectorLayerSymbolLegendApplyToTypes) as optionApplyTo}
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
  </div>

  <div
    class="columns"
    style="margin-right: -56px;">
    <div class="column">
      <div class="has-text-centered pb-2">Classification</div>
      <div class="is-flex is-justify-content-center">
        <div class="select is-small is-justify-content-center">
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

  <div
    class="columns"
    style="margin-right: -56px;">
    {#if applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR}
      <div class="column size">
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
      </div>
    {/if}

    {#if applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_SIZE}
      <div class="column size">
        <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
          <thead>
            <tr>
              <th>Icon</th>
              <th>Start</th>
              <th>End</th>
            </tr>
          </thead>
          <tbody>
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
          </tbody>
        </table>
      </div>
    {/if}
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

  .symbol-advanced-container {
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
