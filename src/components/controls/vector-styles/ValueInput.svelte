<script lang="ts">
  import RangeSlider from 'svelte-range-slider-pips'
  import Tags from '$components/Tags.svelte'
  import { createEventDispatcher } from 'svelte'
  import { map, filterInputTags } from '$stores'
  import arraystat from 'arraystat'

  export let propertySelectedValue
  export let expressionValue
  export let acceptSingleTag = true
  export let layer
  export let operator

  let dataType = layer.info.json.vector_layers[0].fields[propertySelectedValue]
  //console.log(layer.info.json.vector_layers[0].fields)
  const layerId = layer.definition.id

  const dispatch = createEventDispatcher()

  const layers = $map.getStyle().layers.filter((layer) => layer.id === layerId)

  const features = layers.map((layer) => $map.queryRenderedFeatures({ layers: layers.map((layer) => layer.id) }))

  // get the values of the property for each feature
  const values = features.map((feature) => feature.map((feature) => feature.properties[propertySelectedValue]))

  $: tagsList = $filterInputTags
  let optionsList: [] = [...new Set(values.flat())]
  const sol = Array.from(optionsList).sort((a, b) => a - b)

  const astats = arraystat(sol)

  const nn = 5
  const min = astats.min
  const max = astats.max
  let calculatedStep = Number.isInteger(min) ? (astats.range * 1e-2) | 0 : astats.range * 1e-2
  const fclosest = (array, goal) =>
    array.reduce((prev, curr) => (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev))
  const findClosest = (x: number, arr: Array<number>) => {
    const indexArr = arr.map(function (k) {
      return Math.abs(k - x)
    })
    const min = Math.min.apply(Math, indexArr)
    return arr[indexArr.indexOf(min)]
  }

  let sv = [findClosest(astats.median, sol)]

  //console.log(`sv is ${sv}`)
  let vals: Array<number> = []
  let svals: Array<number> = []

  let sindex
  let eindex
  let closest: number
  let index: number
  $: {
    closest = fclosest(sol, sv[0])
    index = sol.indexOf(closest)
    //console.log(` value: ${sv}, index: ${index}, closest ${closest}`)
    sindex = index - nn < 0 ? 0 : index - nn
    eindex = index + nn > sol.length - 1 ? sol.length : index + nn
    vals = sol.slice(sindex, eindex)
    svals = vals.sort()
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

  const apply = () => {
    dispatch('apply')
  }

  // const nFormatter = (num: number, digits = 0) => {
  //   const lookup = [
  //     { value: 1, symbol: '' },
  //     { value: 1e3, symbol: 'K' },
  //     { value: 1e6, symbol: 'M' },
  //     { value: 1e9, symbol: 'G' },
  //     { value: 1e12, symbol: 'T' },
  //     { value: 1e15, symbol: 'P' },
  //     { value: 1e18, symbol: 'E' },
  //   ]
  //   const rx = /\.0+$|(\.[0-9]*[1-9])0+$/
  //   var item = lookup
  //     .slice()
  //     .reverse()
  //     .find(function (item) {
  //       return num >= item.value
  //     })
  //   return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0'
  // }
</script>

{#if values}
  <div class="content" style="width:100%; height:100%">
    {#if dataType === 'String'}
      <div>
        {#if acceptSingleTag}
          <div class="notification has-background-danger-light is-size-6 has-text-danger">
            <i class="fa-solid fa-circle-info has-text-danger" /> Only one value can be accepted when equals = or ≠ \n operators
            are used
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
    {:else if !['<', '>'].includes(operator)}
      <div class="range-slider">
        <RangeSlider
          bind:values={sv}
          float
          pips={calculatedStep}
          {min}
          {max}
          step={calculatedStep}
          range="min"
          first="label"
          last="label"
          rest={false} />
      </div>

      <div class="buttons">
        {#each svals as v}
          <button
            on:click={() => {
              expressionValue = v
              apply()
            }}
            class="button has-background-info-light">{v}</button>
        {/each}
      </div>
    {:else}
      <div class="range-slider">
        <RangeSlider
          bind:values={sv}
          float
          pips={calculatedStep}
          {min}
          {max}
          step={calculatedStep}
          range="min"
          first="label"
          last="label"
          rest={false}
          on:stop={onSliderStop} />
      </div>
      <div class="columns is-centered pb-2">
        <button class="button is-small primary-button" on:click={apply}> Use selected </button>
      </div>
    {/if}
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
