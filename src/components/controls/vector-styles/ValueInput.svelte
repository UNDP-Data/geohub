<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import Tags from '$components/Tags.svelte'
  import { createEventDispatcher } from 'svelte'
  import { map } from '$stores'

  export let propertySelectedValue
  export let expressionValue
  export let acceptSingleTag = true
  export let layer

  let dataType = layer.info.json.vector_layers[0].fields[propertySelectedValue]
  const layerId = layer.definition.id

  const dispatch = createEventDispatcher()

  const layers = $map.getStyle().layers.filter((layer) => layer.id === layerId)
  const features = layers.map((layer) => $map.queryRenderedFeatures({ layers: layers.map((layer) => layer.id) }))

  // get the values of the property for each feature
  const values = features.map((feature) => feature.map((feature) => feature.properties[propertySelectedValue]))

  let tagsList = []
  let optionsList: [] = [...new Set(values.flat())]
  let hideOptions = true
  let step
  let min
  let max
  let calculatedStep

  $: {
    if (dataType === 'Number' || dataType.includes('int') || dataType.includes('float')) {
      min = Math.min(...values.flat())
      max = Math.max(...values.flat())
      calculatedStep = (max - min) / 100
    }
  }

  const onSliderStop = (event) => {
    dispatch('sliderStop', event.detail)
    console.log(event.detail)
    expressionValue = event.detail.value
  }
  const handleTags = (event: CustomEvent) => {
    dispatch('tags', event.detail)
    tagsList = event.detail.tags
    expressionValue = tagsList
  }

  /*
   * The first check if for the datatype
   * The second check is for the number of values
   * */
</script>

{#if values}
  <div class="card-content">
    <div class="content" style="width:100%; height:100%">
      <!--      -->
      {#if dataType === 'String'}
        <div>
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
          <button
            style="margin-top:5%; margin-left: 62%"
            class="button is-small primary-button"
            on:click={() => {
              dispatch('apply')
            }}>Confirm Selection</button>
        </div>
      {:else if optionsList.length > 25}
        <div style="display: block;">
          <RangeSlider
            bind:values={expressionValue}
            float
            range
            {min}
            {max}
            pips
            first="label"
            last="label"
            {calculatedStep}
            rest={false}
            on:stop={onSliderStop} />
        </div>
        <input bind:value={expressionValue} class="input is-small" type="text" placeholder="Value" />
      {:else}
        <RangeSlider
          bind:values={expressionValue}
          float
          range
          {min}
          {max}
          pips
          first="label"
          last="label"
          {step}
          pipstep={step}
          rest={false}
          on:stop={onSliderStop} />
        <input bind:value={expressionValue} class="input is-small" type="text" placeholder="Value" />
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
</style>
