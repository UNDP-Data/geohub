<script lang="ts">
  import {
    ClassificationMethodNames,
    ClassificationMethodTypes,
    LayerInitialValues,
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MINIMUM,
    COLOR_CLASS_COUNT_MAXIMUM,
  } from '$lib/constants'
  import type { Layer } from '$lib/types'

  import NumberInput from '$components/controls/NumberInput.svelte'
  import TextField from '$components/controls/vector-styles/TextField.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id

  let classificationMethod = ClassificationMethodTypes.EQUIDISTANT
  let classificationMethods = [
    { name: ClassificationMethodNames.EQUIDISTANT, code: ClassificationMethodTypes.EQUIDISTANT },
    { name: ClassificationMethodNames.QUANTILE, code: ClassificationMethodTypes.QUANTILE },
  ]

  const handlePropertyChange = () => {}

  const handleClassificationChange = () => {}

  const handleIncrementDecrementClasses = () => {}

  export let numberOfClasses = COLOR_CLASS_COUNT
  export let numberOfClassesMax = COLOR_CLASS_COUNT_MAXIMUM
  export let numberOfClassesMin = COLOR_CLASS_COUNT_MINIMUM

  const optionsApplyTo = ['icon size', 'icon color']
  let optionsApplyToSelected = 'icon size'
</script>

<div class="symbol-advanced-container">
  <div class="columns property-classification">
    <div class="column property">
      <div class="is-flex is-justify-content-center">Property</div>
      <div class="is-flex is-justify-content-center">
        <TextField on:change={handlePropertyChange} bind:layer enabledTextLabel={true} />
      </div>
    </div>
    <div class="column classification">
      <div class="is-flex is-justify-content-center">Classification</div>
      <div class="is-flex is-justify-content-center">
        <div class="select is-rounded is-justify-content-center">
          <select
            bind:value={classificationMethod}
            on:change={handleClassificationChange}
            style="width: 114px;"
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
      <div class="is-flex is-justify-content-center">Classes</div>
      <div class="is-flex is-justify-content-center">
        <NumberInput
          bind:value={numberOfClasses}
          bind:minValue={numberOfClassesMin}
          bind:maxValue={numberOfClassesMax}
          on:change={handleIncrementDecrementClasses} />
      </div>
    </div>

    <div class="column icon-size-color">
      <div class="is-flex is-justify-content-center">Apply To</div>
      <div class="is-flex is-justify-content-center">
        <div>
          {#each optionsApplyTo as optionApplyTo}
            <div class="columns is-gapless" style="margin-bottom: 0;">
              <div class="column">
                <input
                  type="radio"
                  name="layer-type"
                  bind:group={optionsApplyToSelected}
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

    .icon-size-color {
      div:first-child {
        margin-bottom: 10px;
      }
    }

    input[type='radio'] {
      cursor: pointer;
    }
  }
</style>
