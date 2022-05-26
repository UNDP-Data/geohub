<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'
  import { debounce } from 'lodash-es'
  import { Jenks } from 'jenks'

  import IntervalsLegendColorMapRow from '$components/IntervalsLegendColorMapRow.svelte'
  import NumberInput from '$components/controls/NumberInput.svelte'
  import TextField from '$components/controls/vector-styles/TextField.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT_MAXIMUM,
    COLOR_CLASS_COUNT_MINIMUM,
    LayerInitialValues,
    VectorLayerSymbolLegendApplyToTypes,
  } from '$lib/constants'
  import type {
    IntervalLegendColorMapRow,
    Layer,
    VectorLayerTileStatAttribute,
    VectorLayerTileStatLayer,
  } from '$lib/types'

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
  let numberOfClasses = layer.intervals.numberOfClasses

  // update layer store upon change of apply to option
  $: if (applyToOption) {
    layer.intervals.applyToOption = applyToOption
  }

  // update color intervals upon change of color map name
  $: {
    if (layer && colorMapName !== layer.colorMapName) {
      colorMapName = layer.colorMapName
      setIntervalValues()
    }
  }

  onMount(() => {
    setIntervalValues()
  })

  const handlePropertyChange = (e: CustomEvent) => {
    console.log('handlePropertyChange')
    layer.intervals.propertyName = e.detail.textFieldValue
    setIntervalValues()
  }

  const handleClassificationChange = () => {
    console.log('handleClassificationChange')
    layer.intervals.classification = classificationMethod
    setIntervalValues()
  }

  const handleIncrementDecrementClasses = () => {
    console.log('handleIncrementDecrementClasses')
    layer.intervals.numberOfClasses = numberOfClasses
    setIntervalValues()
  }

  // encode colormap and update url parameters
  const handleParamsUpdate = debounce(() => {
    console.log('handleParamsUpdate')
  }, 500)

  const handleColorPickerClick = (event: CustomEvent) => {
    console.log(event)
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
            const propertyValues = []

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

              propertyValues.push(row)
            }

            if (applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR) {
              layerMax = Math.max.apply(null, values)
              layerMin = Math.min.apply(null, values)
            }

            layer.intervals.colorMapRows = propertyValues
          }
        }
      }
    }
  }
</script>

<div class="symbol-advanced-container">
  <div class="columns property-classification">
    <div class="column property">
      <div class="is-flex is-justify-content-center">Property</div>
      <div class="is-flex is-justify-content-center">
        <TextField on:change={handlePropertyChange} bind:layer enabledTextLabel={true} hasLayerListNumbersOnly={true} />
      </div>
    </div>
    <div class="column apply-to">
      <div class="is-flex is-justify-content-center">Apply To</div>
      <div class="is-flex is-justify-content-center">
        <div style="margin-bottom: 0px;">
          {#each Object.values(VectorLayerSymbolLegendApplyToTypes) as optionApplyTo}
            <div class="columns is-gapless" style="margin-bottom: 0;">
              <div class="column">
                <input
                  type="radio"
                  name="layer-type"
                  bind:group={applyToOption}
                  value={optionApplyTo}
                  alt={`${optionApplyTo} Option`}
                  title={`${optionApplyTo} Option`} />
              </div>
              <div class="column is-1" />
              <div class="column is-10" style="position: relative; top: -2px;">
                {optionApplyTo}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div class="is-divider separator" />

  <div class="columns classes-size-color">
    <div class="column classification">
      <div class="is-flex is-justify-content-center">Classification</div>
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
    <div class="column number-classes">
      <div class="is-flex is-justify-content-center">Number of Classes</div>
      <div class="is-flex is-justify-content-center">
        <NumberInput
          bind:value={numberOfClasses}
          minValue={COLOR_CLASS_COUNT_MINIMUM}
          maxValue={COLOR_CLASS_COUNT_MAXIMUM}
          on:change={handleIncrementDecrementClasses} />
      </div>
    </div>
  </div>

  <div class="columns panel-icon-color-size">
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
        <div class="subtitle is-size-6">ICON SIZE</div>
        <div>
          {#each layer.intervals.colorMapRows as colorMapRow}
            <div class="columns">
              <div class="column">{colorMapRow.start}</div>
              <div class="column">{colorMapRow.end}</div>
            </div>
          {/each}
        </div>
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

  .symbol-advanced-container {
    .separator {
      margin-top: 10px;
      margin-bottom: 10px;
    }

    .classification,
    .property,
    .number-classes,
    .apply-to {
      padding-bottom: 0;

      div:first-child {
        margin-bottom: 10px;
      }
    }

    input[type='radio'] {
      cursor: pointer;
    }
  }
</style>
