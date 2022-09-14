<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import { debounce } from 'lodash-es'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import { hexToCSSFilter } from 'hex-to-css-filter'

  import IntervalsLegendColorMapRow from '$components/IntervalsLegendColorMapRow.svelte'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
    LayerInitialValues,
    NO_RANDOM_SAMPLING_POINTS,
    VectorLayerSymbolLegendApplyToTypes,
  } from '$lib/constants'
  import { getIntervalList, getSampleFromInterval, remapInputValue } from '$lib/helper'
  import type {
    IntervalLegendColorMapRow,
    Layer,
    SpriteImage,
    VectorLayerTileStatAttribute,
    VectorLayerTileStatLayer,
  } from '$lib/types'
  import { map, spriteImageList } from '$stores'
  import PropertySelect from './vector-styles/PropertySelect.svelte'

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
  let icon: SpriteImage
  let numberOfClasses = layer.intervals.numberOfClasses
  let propertySelectValue: string = null
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

  // Initially set the zoomLevel to the initial value
  onMount(() => {
    icon = $spriteImageList.find((icon) => icon.alt === getIconImageName())
    zoomLevel = $map.getZoom()
    layer.zoomLevel = zoomLevel
    setCssIconFilter()
    // propertySelectValue = layer.intervals.propertyName === '' ? '' : layer.intervals.propertyName
    // layer.intervals.propertyName = propertySelectValue
    setIntervalValues()
  })

  const setCssIconFilter = () => {
    const rgba = chroma(layer.iconColor ? layer.iconColor : '#000000').rgba()
    cssIconFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex()).filter
  }

  const getIconImageName = () => {
    const propertyName = 'icon-image'
    const style = $map
      .getStyle()
      .layers.filter((mapLayer: LayerSpecification) => mapLayer.id === layer.definition.id)[0]
    return style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle'
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
        const stats = layer.info.stats as VectorLayerTileStatAttribute[]
        const stat = stats.find((val) => val.attribute === tileStatLayerAttribute.attribute)

        if (stat) {
          if (stat.min > 0) {
            classificationMethods = [
              ...classificationMethods,
              ...[{ name: ClassificationMethodNames.LOGARITHMIC, code: ClassificationMethodTypes.LOGARITHMIC }],
            ]
          }
          const randomSample = getSampleFromInterval(stat.min, stat.max, NO_RANDOM_SAMPLING_POINTS)
          const intervalList = getIntervalList(classificationMethod, stat.min, stat.max, randomSample, numberOfClasses)
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
        layer.intervals.applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR
          ? chroma([row.color[0], row.color[1], row.color[2]]).hex('rgb')
          : remapInputValue(Number(row.end), layerMin, layerMax, 0.5, 10),
      ]
    })

    if (layer.intervals.applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR && stops.length > 0) {
      $map.setLayoutProperty(layer.definition.id, 'icon-size', 1)
      $map.setPaintProperty(layer.definition.id, 'icon-color', {
        property: layer.intervals.propertyName,
        type: 'interval',
        stops: stops,
      })
    }

    if (layer.intervals.applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_SIZE && stops.length > 0) {
      // Generate new stops based on the zoomLevel
      if (zoomLevel === undefined) {
        zoomLevel = $map.getZoom()
      }

      // Ends are the
      const intervalEnds = layer.intervals.colorMapRows.map((item) => item.end)
      const ratioOfRadiustoTheFirstEnd = intervalEnds.slice(1).map((item) => (item as number) / Number(intervalEnds[0]))

      // Add 1 to the ratio array
      ratioOfRadiustoTheFirstEnd.unshift(1)

      if (zoomLevel === undefined) {
        zoomLevel = $map.getZoom()
      }

      // newStops array, that takes into considerarion the ratio and the zoomLevel
      const newStops = stops.map((item, index) => [
        item[0],
        (ratioOfRadiustoTheFirstEnd[index] as number) * (zoomLevel / 10),
      ])

      $map.setPaintProperty(layer.definition.id, 'icon-color', layer.iconColor)
      $map.setLayoutProperty(layer.definition.id, 'icon-size', {
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

  const handleApplyToClick = (type: string) => {
    applyToOption = type
  }
</script>

<div class="symbol-advanced-container" data-testid="symbol-advanced-container">
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

  <div class="columns" style="margin-right: -56px;">
    <div class="column">
      <div class="has-text-centered pb-2">Classification</div>
      <div class="is-flex is-justify-content-center">
        <div class="select is-justify-content-center">
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

  <div class="columns" style="margin-right: -56px;">
    {#if applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR}
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
            {#each layer.intervals.colorMapRows as row, index}
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
