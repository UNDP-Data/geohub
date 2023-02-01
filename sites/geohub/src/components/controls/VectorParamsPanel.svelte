<script lang="ts">
  import type { Layer } from '$lib/types'
  import RangeSlider from 'svelte-range-slider-pips'
  import { fetchUrl, getLayerSourceUrl, getLayerStyle, updateParamsInURL, clean, loadMap } from '$lib/helper'
  import { map } from '$stores'

  export let layer: Layer
  let isHDIlayer = false
  let args
  let isLoaded = false
  let selectedArgument = {}
  let selectedArguments = []
  let argumentValues = []
  let minValue
  let maxValue
  let suffix = ''
  let argsCopy = []
  let params = {}
  let showSlider = false

  const getArgumentsInURL = (url) => {
    const urlParams = new URLSearchParams(url.split('?')[1])
    params = {}
    for (const [key, value] of urlParams) {
      params[key] = value
    }
    return params
  }

  const getArguments = async () => {
    isLoaded = await loadMap($map)
    const url = layer.dataset.properties.url
    const layerUrl = getLayerSourceUrl($map, layer.id) as string
    const argsInUrl = getArgumentsInURL(layerUrl)
    const metaJson = await fetchUrl(url.replace('/{z}/{x}/{y}.pbf', '.json'))
    args = JSON.parse(metaJson.arguments[0].default)
    console.log(args)
    return args
  }

  const setArgument = (arg) => {
    selectedArgument = args[arg]
    setValuesForSlider(selectedArgument)
    const index = selectedArguments.findIndex((a) => a.name === selectedArgument.param_name)
    if (index > -1) {
      selectedArguments.splice(index, 1)
      selectedArguments[index] = selectedArgument
      argumentValues = [Number(selectedArgument.value)]
    } else {
      selectedArguments = [...selectedArguments, arg]
      argumentValues = [Number(selectedArgument.param_name)]
    }
    showSlider = true
  }
  const setValuesForSlider = (arg) => {
    argumentValues = [Number(arg.value)]
    minValue = Number(arg.limits.min)
    maxValue = Number(arg.limits.max)
    suffix = arg.units
  }

  const applyParameters = () => {
    const layerURL = new URL(getLayerSourceUrl($map, layer.id))
    const layerStyle = getLayerStyle($map, layer.id)
    console.log(selectedArguments)
    selectedArguments.forEach((arg) => {
      if (args.find((a) => a.default !== arg.default)) {
        params[arg.name] = arg.default
      }
    })
    updateParamsInURL(layerStyle, layerURL, params)
  }

  const clearParameters = () => {
    selectedArguments = []
    args = [...argsCopy]
    selectedArgument = {}
    const layerURL = new URL(getLayerSourceUrl($map, layer.id).split('?')[0])
    const layerStyle = getLayerStyle($map, layer.id)
    updateParamsInURL(layerStyle, layerURL, {})
  }

  const removeArgument = (arg) => {
    selectedArguments = selectedArguments.filter((a) => a.name !== arg.name)
    if (selectedArgument.param_name === arg.name) {
      selectedArgument = {}
    }
    args = argsCopy.map((a) => {
      if (a.name === arg.name) {
        a.default = arg.default
      }
      return a
    })
  }

  const setArgValue = (e) => {
    selectedArgument.param_name = e.detail.value
  }

  const changeArgValue = (e) => {
    console.log(e.detail.value)
    argumentValues = [e.detail.value]
    console.log(argumentValues)
    selectedArgument.param_name = e.detail.value
    args = args.map((arg) => {
      if (arg.name === selectedArgument.param_name) {
        arg.default = e.detail.value
      }
      return arg
    })
  }
</script>

<div>
  {#await getArguments()}
    <p>loading</p>
  {:then args}
    <!--{#if isHDIlayer}-->
    <div class="grid-wrapper">
      {#each Object.entries(args) as [key, v], i}
        {@const { param_name: arg_name, icon: icon, value: value } = v}
        <div
          on:click={() => setArgument(key)}
          class="grid-item card  m-10 is-info is-clickable has-text-centered">
          <div
            class="card-header is-size-6 pb-0 pt-0 m-0 {arg_name === selectedArgument.param_name
              ? 'has-background-success'
              : 'has-background-info-dark'}">
            <span class="card-header-title grid-item is-centered is-v-centered has-text-white-ter ">
              {clean(arg_name)}
            </span>
            <!--{#if selectedArguments.map((a) => a.name).includes(key)}-->
            <button
              on:click={(e) => {
                e.stopPropagation()
              }}
              class="card-header-icon button remove-arg-button"
              aria-label="Remove Argument">
              <span class="icon is-large">
                <i class="fas fa-times has-text-white-ter" />
              </span>
            </button>
          </div>
          <div class="card-content">
            <span class="icon has-text-danger-dark is-size-7 has-text-weight-bold">
              <i class="fas fa-2x {icon}" />
            </span>
          </div>
          <div class="card-footer">
            <span class="m-auto">
              {value}
            </span>
          </div>
        </div>
      {/each}
    </div>

    <div class="is-9 m-auto mt-1">
      {#if showSlider}
        <RangeSlider
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
          {suffix}
          all="label" />
      {/if}
    </div>
    <div class="columns p-3 mt-1">
      <button
        on:click={applyParameters}
        class="button m-auto is-primary">Apply</button>
      <button
        on:click={clearParameters}
        class="button m-auto is-secondary">Clear</button>
    </div>
    <!--{/if}-->
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
</style>
