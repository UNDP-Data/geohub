<script lang="ts">
  import type { Layer } from '$lib/types'
  import RangeSlider from 'svelte-range-slider-pips'
  import { fetchUrl, getLayerSourceUrl, getLayerStyle, updateParamsInURL, clean, loadMap } from '$lib/helper'
  import { map } from '$stores'

  export let layer: Layer

  let args = []
  let isLoaded = false
  let selectedArgument = {}
  let selectedArguments = []
  let argumentValues = []
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
    args = metaJson.arguments
    args.forEach((arg) => {
      if (argsInUrl[arg.name]) {
        arg.default = argsInUrl[arg.name]
      }
    })
    args = args.map((arg) => {
      return {
        name: arg.name,
        default: Number(arg.default),
        type: arg.type,
      }
    })
    return args
  }

  const setArgument = (arg) => {
    showSlider = true
    selectedArgument = arg
    const index = selectedArguments.findIndex((a) => a.name === selectedArgument.name)
    if (index > -1) {
      selectedArguments[index] = selectedArgument
      argumentValues = [Number(selectedArgument.default)]
    } else {
      selectedArguments.push(selectedArgument)
      argumentValues = [Number(selectedArgument.default)]
    }
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

  const setArgValue = (e) => {
    selectedArgument.default = e.detail.value
  }
</script>

<div>
  {#await getArguments()}
    <p>loading</p>
  {:then args}
    <div class="grid-wrapper">
      {#each args as arg, i}
        <div
          on:click={() => setArgument(arg)}
          class="grid-item card  m-10 is-info is-clickable  has-text-centered ">
          <div
            class="card-header is-size-6  pb-0 pt-0 m-0 {selectedArgument.name === arg.name
              ? 'has-background-success'
              : 'has-background-info-dark'}">
            <span class="card-header-title grid-item is-centered is-v-centered has-text-white-ter">
              {clean(arg.name)}
            </span>
          </div>
          <div class="card-content">
            <span class="has-text-danger-dark is-size-7 has-text-weight-bold">
              <i class="fa-solid fa-1" />...<i class="fa-solid fa-9" />
            </span>
          </div>
          <footer class="card-footer">
            {#if selectedArgument.name === arg.name}
              <span class="icon ml-auto">
                <i class="fa-solid fa-check" />
              </span>
            {/if}
          </footer>
        </div>
      {/each}
    </div>

    <div class="is-9 m-auto">
      {#if showSlider}
        <RangeSlider
          min={0}
          max={2}
          step={0.1}
          pipstep={0.1}
          first="label"
          last="label"
          rest={false}
          bind:values={argumentValues}
          on:stop={setArgValue}
          pips="true"
          all="label" />
      {/if}
    </div>
    <div class="columns p-3">
      <button
        on:click={applyParameters}
        class="button m-auto is-primary">Apply</button>
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
</style>
