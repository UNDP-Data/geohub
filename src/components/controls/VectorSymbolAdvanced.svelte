<script lang="ts">
  import chroma from 'chroma-js'
  import { Jenks } from 'jenks'

  import NumberInput from '$components/controls/NumberInput.svelte'
  import TextField from '$components/controls/vector-styles/TextField.svelte'
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    LayerInitialValues,
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MINIMUM,
    COLOR_CLASS_COUNT_MAXIMUM,
    VectorLayerSymbolLegendApplyToTypes,
  } from '$lib/constants'
  import type { Layer, VectorLayerTileStatLayer, VectorLayerTileStatAttribute } from '$lib/types'

  export let applyToOption: string
  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const CLASSIFICATION_METHOD_NATURAL_BREAKS = 'Natural Breaks'
  const classificationMethodsDefault = [
    { name: CLASSIFICATION_METHOD_NATURAL_BREAKS, code: ClassificationMethodTypes.NATURAL_BREAK },
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]

  let numberOfClasses = layer?.intervals?.numberOfClasses ? layer.intervals.numberOfClasses : COLOR_CLASS_COUNT
  let numberOfClassesMax = COLOR_CLASS_COUNT_MAXIMUM
  let numberOfClassesMin = COLOR_CLASS_COUNT_MINIMUM
  let classificationMethod = layer?.intervals?.classification
    ? layer.intervals.classification
    : ClassificationMethodTypes.NATURAL_BREAK
  let classificationMethods = classificationMethodsDefault
  let propertyName = layer?.intervals?.propertyName ? layer.intervals.propertyName : ''
  let propertyValues = []

  $: if (applyToOption && layer?.intervals?.applyToOption) {
    layer.intervals.applyToOption = applyToOption
  }

  const handlePropertyChange = (e: CustomEvent) => {
    console.log('handlePropertyChange')
    propertyName = e.detail.textFieldValue

    if (!layer?.intervals) {
      layer.intervals = {
        classification: classificationMethod,
        numberOfClasses,
        colorMapRows: [],
        propertyName,
        applyToOption,
      }
    }

    calculatePropertyValues()
  }

  const handleClassificationChange = () => {
    console.log('handleClassificationChange')
    layer.intervals.classification = classificationMethod
    calculatePropertyValues()
  }

  const handleIncrementDecrementClasses = () => {
    console.log('handleIncrementDecrementClasses')
    layer.intervals.numberOfClasses = numberOfClasses
    calculatePropertyValues()
  }

  const calculatePropertyValues = () => {
    // set to default values
    classificationMethods = classificationMethodsDefault
    propertyValues = []

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const tilestats = layer?.info?.json?.tilestats

    if (tilestats) {
      const tileStatLayer = tilestats?.layers.find(
        (tileLayer: VectorLayerTileStatLayer) => tileLayer.layer == layer.definition['source-layer'],
      )

      if (tileStatLayer) {
        const tileStatLayerAttribute = tileStatLayer.attributes.find(
          (val: VectorLayerTileStatAttribute) => val.attribute === propertyName,
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

            // create interval list (start / end)
            for (let i = 0; i < intervalList.length - 1; i++) {
              propertyValues.push({
                index: i,
                start: intervalList[i],
                end: intervalList[i + 1],
              })
            }
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
    <div class="column classification">
      <div class="is-flex is-justify-content-center">Classification</div>
      <div class="is-flex is-justify-content-center">
        <div class="select is-rounded is-justify-content-center">
          <select
            bind:value={classificationMethod}
            on:change={handleClassificationChange}
            style="width: 130px;"
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

  <div class="is-divider separator" />

  <div class="columns classes-size-color">
    <div class="column number-classes">
      <div class="is-flex is-justify-content-center">Number of Classes</div>
      <div class="is-flex is-justify-content-center">
        <NumberInput
          bind:value={numberOfClasses}
          bind:minValue={numberOfClassesMin}
          bind:maxValue={numberOfClassesMax}
          on:change={handleIncrementDecrementClasses} />
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

  <div class="columns panel-icon-color-size">
    {#if applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_COLOR}
      <div class="column size">
        <div class="subtitle is-size-6">ICON COLOR</div>
        <div>
          {#each propertyValues as propertyValue}
            <div class="columns">
              <div class="column">{propertyValue.start}</div>
              <div class="column">{propertyValue.end}</div>
            </div>
          {/each}
        </div>
      </div>
    {/if}

    {#if applyToOption === VectorLayerSymbolLegendApplyToTypes.ICON_SIZE}
      <div class="column size">
        <div class="subtitle is-size-6">ICON SIZE</div>
        <div>
          {#each propertyValues as propertyValue}
            <div class="columns">
              <div class="column">{propertyValue.start}</div>
              <div class="column">{propertyValue.end}</div>
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
