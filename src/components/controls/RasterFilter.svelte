<script
  context="module"
  lang="ts">
  const originalRasterFilterUrl = {}
  let selectedFilterOperatorCategory: { name: string; title: string; operators: Array<string>; isVisible: boolean } = {
    name: '',
    title: '',
    operators: [],
    isVisible: false,
  }
  let selectedFilterOperator: string = undefined
  let initialFilterStep: number = 1
</script>

<script lang="ts">
  /*
A component designed to apply where expression to a raster layer through titiler

*/
  import RangeSlider from 'svelte-range-slider-pips'
  import type { Layer, RasterExpression, RasterLayerStats, RasterTileMetadata } from '$lib/types'
  import Wizard from '$components/control-groups/Wizard.svelte'
  import Step from '$components/control-groups/Step.svelte'
  import {
    getActiveBandIndex,
    getLayerStyle,
    getValueFromRasterTileUrl,
    updateParamsInURL,
    getLayerSourceUrl,
    fetchUrl,
  } from '$lib/helper'
  import { map } from '$stores'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import { onMount } from 'svelte'

  export let layer: Layer
  //console.log(JSON.stringify(layer.info, null, '\t'))
  let combineOperator = true
  let expression: RasterExpression
  let selectedOperatorCategory = selectedFilterOperatorCategory || {
    name: '',
    title: '',
    operators: [],
    isVisible: false,
  }
  let selectedOperator = selectedFilterOperator || undefined

  //const rescale = getValueFromRasterTileUrl($map, layer.id, 'rescale') as number[]

  let layerMin: number
  let layerMax: number
  let layerMedian: number

  let info: RasterTileMetadata
  ;({ info } = layer)

  let statistics: RasterLayerStats
  let step: number

  $: {
    console.log(`initial filter step ${initialFilterStep}`)
  }

  const bandIndex = getActiveBandIndex(info) //normlly info should be called as well

  //necessary to create Slider
  const [band, bandMetaStats] = info['band_metadata'][bandIndex]
  layerMin = Number(bandMetaStats['STATISTICS_MINIMUM'])
  layerMax = Number(bandMetaStats['STATISTICS_MAXIMUM'])
  let inputValue: Array<number> = [(layerMax - layerMin) * 0.5]
  const url: string = getLayerSourceUrl($map, layer.id) as string
  const lURL = new URL(url)

  originalRasterFilterUrl[layer.id] = url

  onMount(async () => {
    console.log(`mount ${initialFilterStep}`)
    if (!('stats' in info)) {
      const statsURL = `${PUBLIC_TITILER_ENDPOINT}/statistics?url=${url}`
      statistics = await fetchUrl(statsURL)
      info = { ...info, stats: statistics }
    }

    //console.log(info.stats)
    const band = Object.keys(info.stats)[bandIndex]
    layerMin = Number(info.stats[band].min)
    layerMax = Number(info.stats[band].max)
    layerMedian = Number(info.stats[band].median)

    // this ensures the slider state is set to layer min max

    const range = layerMax - layerMin
    step = Number.isInteger(layerMedian) && Number.isInteger(layerMin) ? ~~(range * 1e-4) || 1 : range * 1e-4
    inputValue = [range * 0.5]
  })

  const operatorCategories: Array<{
    name: string
    title: string
    icon: string
    operators: Array<string>
    isVisible: boolean
  }> = [
    {
      name: 'arithmetic',
      title: 'Arithmetic',
      icon: 'fa-solid fa-plus-minus',
      operators: ['*', '/', '+', '-', '%', '**'],
      isVisible: true,
    },
    // {
    //   name: 'numbers',
    //   title: 'Numbers',
    //   icon: 'fa-solid fa-arrow-down-1-9',
    //   operators: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '(', ')'],
    //   isVisible: true,
    // },
    {
      name: 'comparison',
      title: 'Comparison',
      icon: 'fa-solid fa-equals',
      operators: ['==', '!=', '>=', '<', '>', '<='],
      isVisible: true,
    },
    // {
    //   name: 'functions',
    //   title: 'Functions',
    //   icon: 'fa-solid fa-square-root-variable',
    //   operators: ['sin', 'cos', 'tan', 'log', 'exp', 'sqrt', 'abs', 'where'],
    //   isVisible: true,
    // },
  ]
  const clearExpression = () => {
    console.log(`clearing expression`)
    updateParamsInURL(getLayerStyle($map, layer.id), originalRasterFilterUrl[layer.id], {})
  }

  const applyExpression = async (e: MouseEvent) => {
    let newParams = {}
    console.log(`applying... ${e}`)
    expression = { band: bandIndex + 1, operator: selectedOperator, pixelValue: inputValue?.[0] }
    //  console.log(JSON.stringify(expression))
    newParams['expression'] = `b${expression.band}${expression.operator}${expression.pixelValue}`
    const exprStatUrl = new URL(
      `${lURL.protocol}//${lURL.host}/cog/statistics?url=${url}}&expression=${encodeURIComponent(
        newParams['expression'],
      )}`,
    )

    const exprStats: RasterLayerStats = await fetchUrl(exprStatUrl.toString())
    console.log(exprStats)

    //updateParamsInURL(getLayerStyle($map, layer.id), lURL, newParams)
  }

  const cancel = () => {
    selectedOperatorCategory = { name: '', title: '', operators: [], isVisible: false }
    selectedOperator = undefined
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://cdn.rawgit.com/octoshrimpy/bulma-o-steps/master/bulma-steps.css" />
</svelte:head>

<!-- <div class="tile is-ancestor is-centered m-0 has-tooltip-info" data-tooltip="A test">
    <div class="tile is-parent">
        <div class="tile is-child notification is-white has-text-centered subtitle p-0 " >
           
            <div class="field">
                <input
                id="switchCombine"
                type="checkbox"
                name="switchCombine"
                class="switch is-rounded "
                
                bind:checked={combineOperator} />
                <label
                for="switchCombine"
                class="is-size-6">All conditions must be true</label>
            </div>
        </div>
    </div>
    
</div>

<div class="is-divider m-1 p-1" /> -->

<Wizard initialStep={initialFilterStep}>
  <Step
    num={1}
    let:nextStep>
    <div class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pl-3 pb-3">
      <button
        on:click={() => {
          nextStep()
          initialFilterStep = 2
        }}
        class="button wizard-button is-small primary-button has-text-weight-bold">
        <i class="fas fa-plus" />
        &nbsp; {expression ? 'Add' : 'New rule'}
      </button>
    </div>
    <div class="notification is-danger is-light has-text-centered p-1">
      Conditions (rules) can be <span class="has-text-weight-bold">evaluated</span> against the pixels of the layer. By applying
      a rule the layer is transformed and change appearance.
    </div>
    <figure class="image p-2">
      <img
        alt=""
        width="300"
        src="/map_algebra_unilayer.png" />
    </figure>
  </Step>

  <Step
    num={2}
    let:nextStep
    let:setStep
    let:prevStep>
    <div class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pl-3 pr-3">
      <button
        on:click={prevStep}
        title="move back to start"
        class="button  is-small secondary-button has-text-weight-bold">
        <i class="fa fa-angles-left" /> &nbsp;Back
      </button>
      <button
        on:click={() => {
          setStep(1)
          cancel()
        }}
        class="button  is-small primary-button has-text-weight-bold">
        <i class="fa-solid fa-circle-xmark" /> &nbsp;Cancel
      </button>

      <!-- <button
          on:click={()=>{setStep(1);clearExpression()}}
          class="button is-small primary-button">
          <i class="fas fa-trash " />&nbsp;Clear filter{expression  ? '(s)' : ''}
        </button> -->
    </div>

    <div
      class="is-divider separator is-danger"
      data-content="Select an operator category..." />

    <div class="grid">
      {#each Object.values(operatorCategories) as operatorCategory}
        <div
          class="card is-info is-clickable  has-text-centered "
          on:click={() => {
            selectedOperatorCategory = operatorCategory
            selectedFilterOperatorCategory = selectedOperatorCategory
            initialFilterStep = 3
            nextStep()
          }}
          title={operatorCategory.title}>
          <div
            class="card-header is-size-6 {operatorCategory.name === selectedOperatorCategory.name
              ? 'has-background-success'
              : 'has-background-info-dark'} ">
            <span
              class="card-header-title is-centered is-v-centered {operatorCategory.name ===
              selectedOperatorCategory.name
                ? 'has-text-white-ter'
                : 'has-text-white-ter'}  ">
              {#if operatorCategory.name === selectedOperatorCategory.name}
                <span class="icon ">
                  <i class="fa-solid fa-check" />
                </span>
              {/if}
              {operatorCategory.title}
            </span>
          </div>
          <div class="content">
            <span class="box has-text-danger-dark is-size-5 has-text-weight-bold">
              <i class={operatorCategory.icon} />
            </span>
          </div>
        </div>
      {/each}
    </div>
  </Step>

  <Step
    num={3}
    let:nextStep
    let:setStep
    let:prevStep>
    <div class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pl-3 pr-3">
      <button
        on:click={prevStep}
        title="move back to start"
        class="button  is-small secondary-button has-text-weight-bold">
        <i class="fa fa-angles-left" /> &nbsp;Operator categories
      </button>
      <button
        on:click={() => {
          setStep(1)
          cancel()
        }}
        class="button  is-small primary-button has-text-weight-bold">
        <i class="fa-solid fa-circle-xmark" /> &nbsp;Cancel
      </button>

      <!-- <button
          on:click={()=>{setStep(1);clearExpression()}}
          class="button is-small primary-button">
          <i class="fas fa-trash " />&nbsp;Clear filter{expression  ? '(s)' : ''}
        </button> -->
    </div>

    <div
      class="is-divider separator is-danger"
      data-content="Select an operator ..." />

    <div class="grid-container">
      {#each selectedOperatorCategory.operators as operator}
        <button
          on:click={() => {
            selectedOperator = operator
            selectedFilterOperator = selectedOperator
            initialFilterStep = 4
            nextStep()
          }}
          class="button  {operator === selectedOperator
            ? 'is-success is-dark'
            : 'is-outlined is-info'} has-text-weight-bold ">
          {operator}
        </button>
      {/each}
    </div>
  </Step>
  <Step
    num={4}
    let:nextStep
    let:setStep
    let:prevStep>
    <div class="is-flex is-flex-direction-row is-justify-content-space-between is-align-items-center pl-3 pr-3">
      <button
        on:click={prevStep}
        title="move back to start"
        class="button  is-small secondary-button">
        <i class="fa fa-angles-left" /> &nbsp;Operators
      </button>
      <button
        on:click={() => {
          setStep(1)
          cancel()
        }}
        class="button  is-small primary-button has-text-weight-bold">
        <i class="fa-solid fa-circle-xmark" /> &nbsp;Cancel
      </button>

      <!-- <button
          on:click={()=>{setStep(1);clearExpression()}}
          class="button is-small primary-button">
          <i class="fas fa-trash " />&nbsp;Clear filter{expression  ? '(s)' : ''}
        </button> -->
    </div>

    <div
      class="is-divider separator is-danger"
      data-content="Set pixel value ..." />
    <div class="range-slider">
      <RangeSlider
        bind:values={inputValue}
        float
        pips={step}
        min={layerMin}
        max={layerMax}
        {step}
        range="min"
        first="label"
        last="label"
        rest={false} />
    </div>
    <div>
      <button
        class="button is-small primary-button"
        on:click={applyExpression}>
        <i class="fa fa-hammer" />&nbsp; Apply
      </button>
    </div>
  </Step>
</Wizard>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(40px, 1fr));
    grid-gap: 5px;
    padding: 0px;
    grid-auto-flow: dense;
    /* align-content: space-around; */
    justify-content: space-around;
    /* grid-auto-columns: 1fr; */
  }

  .grid-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(5px, 1fr));
    grid-gap: 5px;
    grid-auto-flow: dense;
  }

  .range-slider {
    --range-handle-focus: #2196f3;
    --range-handle-inactive: #2196f3;
    --range-handle: #2196f3;
    --range-range-inactive: #2196f3;
    margin: 0;
  }
</style>
