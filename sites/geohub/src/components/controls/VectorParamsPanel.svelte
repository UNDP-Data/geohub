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
  import { map } from '$stores'

  export let layer: Layer
  let args
  let isLoaded = false
  let selectedArguments = []
  let currentSelectedArgument = {}
  let argumentValues = []
  let minValue
  let maxValue
  let suffix = ''
  let params = {}
  let showSlider = false
  $: currentSelectedValue = currentSelectedArgument.value

  // $: currentSelectedArgument,
  const getArgumentsInURL = (url) => {
    const urlParams = new URLSearchParams(url.split('?')[1])
    params = {}
    for (const [key, value] of urlParams) {
      params[key] = value
    }
    return params
  }

  const getInitializingArguments = async () => {
    isLoaded = await loadMap($map)
    const url = layer.dataset.properties.url

    const layerUrl = getLayerSourceUrl($map, layer.id) as string
    const argsInUrl = getArgumentsInURL(layerUrl)

    const metaJson = await fetchUrl(url.replace('/{z}/{x}/{y}.pbf', '.json'))

    args = JSON.parse(metaJson.arguments[0].default)

    if (argsInUrl.params) {
      Object.keys(JSON.parse(argsInUrl.params)).map((key) => {
        selectedArguments = [...selectedArguments, args[key]]
      })
      selectedArguments.forEach((arg) => {
        const id = arg.id
        arg.value = JSON.parse(argsInUrl.params)[id].value
      })
      currentSelectedArgument = selectedArguments[selectedArguments.length - 1]
      argumentValues = [Number(currentSelectedArgument.value)]
      showSlider = true
    }
    return args
  }

  const setArgument = (key) => {
    currentSelectedArgument = args[key]
    if (selectedArguments.map((a) => a.id).includes(currentSelectedArgument.id)) {
      selectedArguments = selectedArguments.filter((a) => a.id !== currentSelectedArgument.id)
      currentSelectedArgument = {}
      currentSelectedArgument.value = -5
      argumentValues = [0]
    } else {
      // push the argument to the selectedArguments array
      selectedArguments = [...selectedArguments, currentSelectedArgument]
      setValuesForSlider(currentSelectedArgument)
      showSlider = true
    }
  }
  const setValuesForSlider = (arg) => {
    // const key = Object.keys(arg)[0]
    argumentValues = [Number(arg.value)]
    minValue = Number(arg.limits.min)
    maxValue = Number(arg.limits.max)
    suffix = arg.units
  }

  const applyParameters = async () => {
    if (selectedArguments.length === 0) {
      return
    }
    const layerStyle = getLayerStyle($map, layer.id)
    const layerURL = new URL(getLayerSourceUrl($map, layer.id).split('?')[0])
    let parameters = {}
    // parameters format needs to be as follows = {arg.id: {value: arg.value}, arg.id: {value: arg.value}}
    selectedArguments.forEach((arg) => {
      const id = arg.id
      parameters[id] = {
        value: arg.value,
      }
    })
    params = {
      params: JSON.stringify(parameters),
    }
    await updateLayerURL(layerStyle, layerURL, params)
  }

  const clearParameters = () => {
    selectedArguments = []
    currentSelectedArgument = {}
    argumentValues = [0]
    const keys = Object.keys(args)
    keys.forEach((key) => {
      args[key].value = 0
    })
    const layerURL = new URL(getLayerSourceUrl($map, layer.id).split('?')[0])
    const layerStyle = getLayerStyle($map, layer.id)
    updateLayerURL(layerStyle, layerURL, {})
  }

  const changeArgValue = (e) => {
    if (Object.keys(currentSelectedArgument).length === 0) {
      return
    }
    currentSelectedArgument.value = e.detail.value
  }
</script>

<div>
  {#await getInitializingArguments()}
    <div>
      <div class="loader-container">
        <Loader size="small" />
      </div>
    </div>
  {:then args}
    <div class="grid-wrapper">
      {#each Object.entries(args) as [key, v], i}
        {@const { param_name: arg_name, icon: icon, value: value, units: units, label: label, id: id } = v}
        <div
          on:click={() => setArgument(key)}
          class="grid-item card is-info is-clickable has-text-centered">
          <header class="card-header is-flex is-justify-content-space-between is-align-content-center	">
            <div class="card-header-title is-10">
              <span class="m-auto icon has-text-primary is-size-7 has-text-weight-bold">
                <i class="fas fa-3x {icon}" />
              </span>
            </div>
            <div class="is-2">
              {#if selectedArguments
                .map((a) => {
                  return a.id
                })
                .includes(key)}
                <button
                  class="card-header-icon"
                  aria-label="more options">
                  <span class="icon has-text-success">
                    <i
                      class="fas fa-circle-check"
                      aria-hidden="true" />
                  </span>
                </button>
              {/if}
            </div>
          </header>
          <div class="card-content">
            <div class="content multiline has-text-weight-bold">
              {label}
            </div>
          </div>
          <div class="card-footer">
            <span class="m-auto">
              {currentSelectedArgument.id === id ? currentSelectedArgument.value : value}
              {units}
            </span>
          </div>
        </div>

        <!--        <div-->
        <!--          on:click={() => setArgument(key)}-->
        <!--          class="grid-item card  m-10 is-info is-clickable has-text-centered">-->
        <!--          <div-->
        <!--            class="card-header is-size-6 pb-0 pt-0 m-0 {currentSelectedArgument.param_name === arg_name-->
        <!--              ? 'has-background-success'-->
        <!--              : 'has-background-info-dark'}">-->
        <!--            <span class="card-header-title grid-item is-centered is-v-centered has-text-white-ter ">-->
        <!--              {clean(label)}-->
        <!--            </span>-->
        <!--            {#if selectedArguments.map((a) => {return a.id}).includes(key)}-->
        <!--              <button-->
        <!--                on:click={(e) => {-->
        <!--                  e.stopPropagation()-->
        <!--                  removeArgument(key)-->
        <!--                }}-->
        <!--                class="card-header-icon button remove-arg-button"-->
        <!--                aria-label="Remove Argument">-->
        <!--                <span class="icon is-large">-->
        <!--                  <i class="fas fa-times has-text-white-ter" />-->
        <!--                </span>-->
        <!--              </button>-->
        <!--            {/if}-->
        <!--          </div>-->
        <!--          <div class="card-content">-->
        <!--            <span class="icon has-text-black is-size-7 has-text-weight-bold">-->
        <!--              <i class="fas fa-2x {icon}" />-->
        <!--            </span>-->
        <!--          </div>-->
        <!--          <div class="card-footer">-->
        <!--            <span class="m-auto">-->
        <!--              {currentSelectedArgument.param_name === arg_name-->
        <!--                ? currentSelectedArgument.value-->
        <!--                : value} {units}-->
        <!--            </span>-->
        <!--          </div>-->
        <!--        </div>-->
      {/each}
    </div>

    <div class="is-9 m-auto mt-1">
      {#if showSlider}
        <RangeSlider
          disabled={selectedArguments.length === 0}
          min={minValue}
          max={maxValue}
          step={0.1}
          pipstep={0.1}
          first="label"
          last="label"
          rest={false}
          bind:values={argumentValues}
          on:change={changeArgValue}
          pips="true"
          all="label" />
      {/if}
    </div>
    <div class="columns p-3 mt-1">
      <button
        disabled={selectedArguments.length === 0}
        on:click={applyParameters}
        class="button m-auto is-primary">Apply</button>
      <button
        disabled={selectedArguments.length === 0}
        on:click={clearParameters}
        class="button m-auto is-secondary">Clear</button>
    </div>
  {/await}
</div>

<style lang="scss">
  .grid-wrapper {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .grid-item {
    display: inline-block;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
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
