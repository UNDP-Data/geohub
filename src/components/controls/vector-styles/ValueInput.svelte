<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import Tags from '$components/Tags.svelte'
  import { createEventDispatcher } from 'svelte'
  import { map, filterInputTags } from '$stores'

  export let propertySelectedValue
  export let expressionValue
  export let acceptSingleTag = true
  export let layer

  let dataType = layer.info.json.vector_layers[0].fields[propertySelectedValue]
  console.log(layer.info.json.vector_layers[0].fields)
  const layerId = layer.definition.id

  const dispatch = createEventDispatcher()

  const layers = $map.getStyle().layers.filter((layer) => layer.id === layerId)
  const features = layers.map((layer) => $map.queryRenderedFeatures({ layers: layers.map((layer) => layer.id) }))

  // get the values of the property for each feature
  const values = features.map((feature) => feature.map((feature) => feature.properties[propertySelectedValue]))

  $: tagsList = $filterInputTags
  let optionsList: [] = [...new Set(values.flat())]
  let hideOptions = true
  let step
  let min
  let max
  let calculatedStep
  let sliderValues = []
  let sv: number[] = []
  $: {
    if (dataType === 'Number' || dataType.includes('int') || dataType.includes('float')) {
      min = Math.min(...values.flat())
      max = Math.max(...values.flat())
      sliderValues = [min, max]
      calculatedStep =
        dataType.includes('int') || Number.isInteger(min) ? Math.round((max - min) * 1e-2) | 0 : (max - min) * 1e-2

      sv[0] = dataType.includes('int') || Number.isInteger(min) ? Math.round((max - min) * 0.5) | 0 : (max - min) * 0.5
      console.log(dataType), calculatedStep
    }
  }

  const onSliderStop = (event) => {
    expressionValue = event.detail.value
    dispatch('sliderStop', event.detail)
  }

  const handleTags = (event: CustomEvent) => {
    tagsList = event.detail.tags
  }

  const applyTags = () => {
    dispatch('apply')
    const filteredTags = tagsList.filter((tag) => !optionsList.includes(tag))
    $filterInputTags = [...$filterInputTags, ...filteredTags]
    if (filteredTags.length > 0) {
      dispatch('customTags', tagsList)
    } else {
      expressionValue = tagsList
    }
  }

  const apply = (e) => {
    dispatch('apply')
  }

  const nFormatter = (num: number, digits = 0) => {
    const lookup = [
      { value: 1, symbol: '' },
      { value: 1e3, symbol: 'K' },
      { value: 1e6, symbol: 'M' },
      { value: 1e9, symbol: 'G' },
      { value: 1e12, symbol: 'T' },
      { value: 1e15, symbol: 'P' },
      { value: 1e18, symbol: 'E' },
    ]
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
    var item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return num >= item.value
      })
    return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0'
  }
</script>

{#if values}
  <div class="card-content">
    <div class="content" style="width:100%; height:100%">
      {#if dataType === 'String'}
        <div>
          {#if acceptSingleTag}
            <div class="notification has-background-danger-light is-size-6 has-text-danger">
              <i class="fa-solid fa-circle-info has-text-danger" /> Only one value can be accepted when equals = or ≠ \n
              operators are used
            </div>
          {/if}
          <Tags
            on:tags={handleTags}
            maxTags={acceptSingleTag ? 1 : 100}
            addKeys={[9, 13]}
            splitWith={'/'}
            onlyUnique={true}
            removeKeys={[27]}
            placeholder={'Select a value...'}
            autoComplete={optionsList}
            tags={tagsList}
            allowBlur={true}
            disable={false}
            minChars={0}
            onlyAutocomplete={true}
            labelShow={false}
            class={acceptSingleTag && tagsList.length > 0 ? 'disable' : null}
            {acceptSingleTag} />
          <div class="pt-4 is-flex flex-wrap is-flex-direction-columns is-justify-content-space-between is-rounded">
            <div>
              <button class="button is-rounded is-small is-info">
                <i class="fa-solid fa-circle-info " />
              </button>
            </div>
            <div>
              <button disabled={tagsList.length === 0} class="button is-small primary-button" on:click={applyTags}
                >Confirm Selection
              </button>
            </div>
          </div>
        </div>
      {:else if optionsList.length > 25 || dataType.includes('float')}
        <div class="range-slider">
          <RangeSlider
            bind:values={sv}
            float
            pips
            min={Math.min(...optionsList)}
            max={Math.max(...optionsList)}
            step={calculatedStep}
            range="min"
            first="label"
            last="label"
            rest={false}
            on:stop={onSliderStop} />
        </div>
        <button style="margin-top:5%; margin-left: 62%" class="button is-small primary-button" on:click={apply}
          >Use selected
        </button>
      {:else}
        <div class="range-slider">
          <RangeSlider
            bind:values={sliderValues}
            float
            range="min"
            {min}
            {max}
            {step}
            pips
            first="label"
            last="label"
            pipstep={step}
            rest={false}
            on:stop={onSliderStop} />
        </div>

        <button class="button is-small primary-button" on:click={apply}> Use selected </button>
      {/if}
    </div>
  </div>
{/if}

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 1px;
  }

  .grid-item {
    width: 100% !important;
    height: 100% !important;
  }

  .input {
    margin-top: 5%;
    margin-left: auto;
    margin-right: auto;
  }

  .unique-values-card {
    height: 50px;
    width: 50px;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
  }

  .unique-values-card:hover {
    background-color: #f5f5f5;
  }

  .disable {
    pointer-events: none;
    cursor: not-allowed;
  }
  .range-slider {
    --range-handle-focus: #2196f3;
    --range-handle-inactive: #2196f3;
    --range-handle: #2196f3;
    --range-range-inactive: #2196f3;
    margin: 0;
  }
</style>
