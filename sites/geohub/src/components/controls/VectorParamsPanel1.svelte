<script lang="ts">
  import type { Layer } from '$lib/types'
  import RangeSlider from 'svelte-range-slider-pips'
  import { Loader } from '@undp-data/svelte-undp-design/src/lib'
  import {
    clean,
    fetchUrl,
    getLayerSourceUrl,
    getLayerStyle,
    loadMap,
    updateLayerURL,
    updateParamsInURL,
  } from '$lib/helper'
  import { map, layerList } from '$stores'
  import { arg } from 'mathjs'
  /*EXPORTS*/
  export let layerId

  /*STATE*/
  let args = {}
  let defaultArgs = {}
  let selectedArgs = {}
  let currentSelectedArg
  let sliderConfig = {}

  /*REACTIVE STATE*/
  $: layer = $layerList.find((l) => l.id == layerId) as Layer
  $: url = layer.dataset.properties.url
  $: layerUrl = getLayerSourceUrl($map, layer.id) as string
  $: layerURL = new URL(url)
  $: showSlider = Object.keys(selectedArgs).length > 0

  /* FUNCTIONS*/
  const getArgumentsInURL = () => {
    const params = {}

    const llayerURL = new URL(layerUrl)
    console.log(llayerURL.toString())
    for (const [key, value] of llayerURL.searchParams) {
      params[key] = JSON.parse(value)
    }
    return params
  }

  const setArgument = (argId: string) => {
    if (!(argId in selectedArgs)) {
      selectedArgs[argId] = { ...defaultArgs[argId] }
      currentSelectedArg = argId
    } else {
      selectedArgs = { ...(delete selectedArgs[argId] && selectedArgs) }
      currentSelectedArg = undefined
    }
  }

  const init = async () => {
    const isLoaded = await loadMap($map)
    const metaUrl = layerUrl.replace('/{z}/{x}/{y}.pbf', '.json')
    const jsonString = await fetchUrl(metaUrl)
    args = JSON.parse(jsonString.arguments[0].default)

    for (const [k, v] of Object.entries(args)) {
      defaultArgs[k] = { value: Number(v.value) }
    }

    // console.log('hinit', JSON.stringify(selectedArgs, null, 2))
    return isLoaded
  }

  const reset = async () => {
    selectedArgs = {}
    await applyParams()
  }

  const setSliderValue = (e) => {
    if (currentSelectedArg && currentSelectedArg in selectedArgs) {
      selectedArgs[currentSelectedArg].value = e.detail.value
    }
  }

  const applyParams = async () => {
    const layerStyle = getLayerStyle($map, layer.id)
    const params = {
      params: JSON.stringify(selectedArgs),
    }
    // console.log(url)
    await updateLayerURL(layerStyle, layerURL, params)
    console.log(layerURL.toString())
  }

  $: {
    if (currentSelectedArg) {
      const currentArgDef = args[currentSelectedArg]
      const {
        limits: { min, max },
        value,
      } = currentArgDef
      const step = (max - min) * 1e-2

      sliderConfig = { min: min, max: max, step: step, values: [value] }
    }
  }

  //$: console.log(JSON.stringify(selectedArgs, null, 2))
</script>

{#await init()}
  <div>
    <div class="loader-container">
      <Loader size="small" />
    </div>
  </div>
{:then initialized}
  <div class="grid-wrapper">
    {#each Object.entries(args) as [argId, arg]}
      {@const { param_name: arg_name, icon: icon, value: value, units: units, label: label, id: id } = arg}
      {@const displayValue =
        currentSelectedArg && currentSelectedArg in selectedArgs && currentSelectedArg == argId
          ? selectedArgs[currentSelectedArg].value
          : value}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div
        class="card  is-info is-clickable "
        on:click={() => setArgument(argId)}>
        <header class="card-header">
          <div
            class="card-header-title is-flex is-flex-direction-row is-flex-wrap-nowrap is-justify-content-center pr-0 mr-0 ">
            <span class="icon has-text-primary is-flex-grow-5 m-2">
              <i
                class="fas fa-3x {icon}"
                aria-hidden="false" />
            </span>
            <div class="icon has-text-success is-align-self-end p-0 m-0 ">
              <i
                class={!Object.keys(selectedArgs).includes(argId)
                  ? 'fas fa-circle-check is-hidden'
                  : 'fas fa-circle-check'}
                aria-hidden="false" />
            </div>
          </div>
        </header>
        <div class="card-content">
          <div class="content multiline has-text-weight-bold">
            {label}
          </div>
        </div>
        <footer class="card-footer has-background-info-light">
          <div class="content m-auto has-text-info-dark  has-text-weight-bold">
            {displayValue}
            {units}
          </div>
        </footer>
      </div>
    {/each}
  </div>
  <div class="is-9 m-auto mt-1">
    {#if showSlider}
      <RangeSlider
        min={sliderConfig.min}
        max={sliderConfig.max}
        step={0.1}
        pipstep={sliderConfig.step}
        rest={false}
        first="label"
        last="label"
        values={sliderConfig.values}
        on:stop={setSliderValue}
        pips="true"
        all="label" />
    {/if}
  </div>
  <div class="columns p-3 mt-1">
    <button
      on:click={applyParams}
      disabled={!showSlider}
      class="button m-auto is-primary">Apply</button>
    <button
      disabled={!showSlider}
      on:click={reset}
      class="button m-auto is-info">Reset</button>
  </div>
{/await}

<style lang="scss">
  .grid-wrapper {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .grid-item {
    //display: inline-block;
    //text-overflow: ellipsis;
    white-space: pre-wrap;
    //overflow: hidden;
  }
  .range-slider {
    --range-handle-focus: #2196f3;
    --range-handle-inactive: #2196f3;
    --range-handle: #2196f3;
    --range-range-inactive: #2196f3;
    margin: 0;
  }
  .remove-arg-button:hover {
    font-color: #1bbbf5;
  }
  .multiline {
    white-space: pre-wrap;
  }
  .loader-container {
    display: flex;
    align-items: center;
    width: fit-content;
    margin: 0 auto;
  }
</style>
