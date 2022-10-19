<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { clean } from '$lib/helper'
  export let layer
  export let propertySelectValue
  export let showEmptyFields = false
  export let showOnlyNumberFields = false
  export let inLegend = false
  const design1 = true
  let propertySelectOptions = inLegend ? layer.intervals.propertyOptions : undefined

  const dispatch = createEventDispatcher()

  onMount(() => {
    inLegend && !propertySelectOptions ? setPropertyList() : null
    !inLegend ? setPropertyList() : null
  })

  function setPropertyList() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const vectorLayerMeta = JSON.parse(
      JSON.stringify(layer.info.json.vector_layers.find((l) => l.id === layer.definition['source-layer'])),
    )
    if (showOnlyNumberFields === true) {
      Object.keys(vectorLayerMeta.fields).forEach((key) => {
        if (vectorLayerMeta.fields[key] !== 'Number') {
          delete vectorLayerMeta.fields[key]
        }
      })
    }
    propertySelectOptions = Object.keys(vectorLayerMeta.fields)
    if (showEmptyFields === true) {
      propertySelectOptions = ['', ...propertySelectOptions]
    }
    inLegend ? (layer.intervals.propertyOptions = propertySelectOptions) : null
    // propertySelectValue = setDefaultProperty(propertySelectOptions)
    propertyChanged()
  }

  export let setDefaultProperty = (selectOptions: string[]) => {
    if (selectOptions.length === 0) return ''
    return selectOptions[0]
  }

  const propertyChanged = () => {
    dispatch('select', {
      prop: propertySelectValue,
    })
  }

  const handleClick = () => {
    if (propertySelectValue === '') return
    dispatch('click')
  }

  $: propertySelectValue, propertyChanged()
</script>

<div style="max-height: 200px; overflow-y: auto" class="grid-wrapper" role="menu" on:click={handleClick}>
  {#if propertySelectOptions}
    {#each propertySelectOptions as propertySelectOption}
      {#if design1}
        <div 
            class="grid-item card p-0 m-0 is-info is-clickable  has-text-centered"
            on:click={() => {
              propertySelectValue = propertySelectOption;
              handleClick
            }}
            title={layer.info.json.vector_layers[0].fields[propertySelectOption].toLowerCase() === 'string'
            ? `${clean(propertySelectOption)}, textual property`
            : ` ${clean(propertySelectOption)0}, numeric property`}
          >
          <div
            class="card-header is-size-6  pb-0 pt-0 m-0 {propertySelectValue === propertySelectOption
              ? 'has-background-success'
              : 'has-background-info-dark'} ">
            <span
              class="card-header-title grid-item is-centered is-v-centered {propertySelectValue === propertySelectOption
                ? 'has-text-white-ter'
                : 'has-text-white-ter'}  ">
              {clean(propertySelectOption)}
              {#if propertySelectOption === propertySelectValue}
                <span class="icon ">
                  <i class="fa-solid fa-check" />
                </span>
              {/if}
            </span>
          </div>
          <div class="card-content has-text-centered ">
            <div class="content has-text-weight-bold ">
              
              {#if layer.info.json.vector_layers[0].fields[propertySelectOption].toLowerCase() !== 'string'}
                <span  class="tag is-size-6 has-background-danger-dark has-text-white p-1 m-0 ">123456</span>
              {:else}
              <span class="tag is-size-6 has-background-danger-dark has-text-white p-2 m-0 ">Abcdef</span>
                
              {/if}
            </div>
          </div>
            
          
        </div>
        <!-- <div
          class="card grid-item p-0 m-0 is-clickable  "
          on:click={() => {
            propertySelectValue = propertySelectOption;
            handleClick
          }}
          title={layer.info.json.vector_layers[0].fields[propertySelectOption].toLowerCase() === 'string'
            ? 'text property, ex: "Mombassa"'
            : 'numeric property, ex: 43256.55 '}
          >
          <div
            class="card-header is-size-6  pb-0 pt-0 m-0 {propertySelectValue === propertySelectOption
              ? 'has-background-success'
              : 'has-background-info-dark'} ">
            <span
              class="card-header-title is-centered is-v-centered {propertySelectValue === propertySelectOption
                ? 'has-text-white-ter'
                : 'has-text-white-ter'}  ">
              {propertySelectOption}
              {#if propertySelectOption === propertySelectValue}
                <span class="icon ">
                  <i class="fa-solid fa-check" />
                </span>
              {/if}
            </span>
          </div>
          <div class="card-content has-text-centered ">
            <div class="content is-size-4 has-text-weight-bold ">
              
              {#if layer.info.json.vector_layers[0].fields[propertySelectOption].toLowerCase() !== 'string'}
                <span  class="tag has-background-danger-dark has-text-white p-1 m-0 ">123456</span>
              {:else}
              <span class="tag has-background-danger-dark has-text-white p-2 m-0 ">Abcdef</span>
                
              {/if}
            </div>
          </div>
        </div> -->
      {:else}
        <div
          class="card grid-item p-0 m-0  {propertySelectOption === propertySelectValue
            ? 'has-background-success'
            : 'has-background-info-dark'}"
          on:click={() => (propertySelectValue = propertySelectOption)}>
          <div class="card-header is-size-6 is-shadowless">
            <span
              class="card-header-title is-centered p-0 pb-2 pt-2 m-0 {propertySelectOption === propertySelectValue
                ? 'has-text-info-light'
                : 'has-text-white-ter'} ">
              {propertySelectOption}
            </span>
            {#if propertySelectOption === propertySelectValue}
              <span class="icon  ">
                <i class="fa-solid fa-check has-text-black" />
              </span>
            {/if}
          </div>

          <div class="content  has-text-danger-dark has-background-info-light pb-2 pt-2 m-0 ">
            <span class="is-size-7">
              {#if layer.info.json.vector_layers[0].fields[propertySelectOption].toLowercase() !== 'string'}
                ...12345...
              {:else}
                ...abcde...
              {/if}
            </span>
          </div>
        </div>
      {/if}
    {/each}
  {/if}
</div>

<style lang="scss">
  .grid-wrapper {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    //display: grid;
    //grid-auto-columns: minmax(2, auto);
    //grid-auto-flow: ;;
    // grid-template-columns:repeat(2, minmax(0, 1fr));;
    // grid-gap: 10px;
    // padding: 0px;
    //scrollbar-width: thin; /* "auto" or "thin" */
    //scrollbar-color: blue orange;
  }
  .grid-item {
    display: inline-block;
    // border: 1px solid gray;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    //max-width: 60px;
    // cursor: pointer;
    // text-align: center;
  }

  // .fa-spell-check {
  //   position: absolute;
  //   top: 0;
  //   right: 0;
  // }
  // :global(.vector-property-card) {
  //   margin: 0;
  //   padding: 0;
  //   width: 100%;
  //   height: 50px;
  // }

  // .vector-property-card:hover {
  //   background-color: rgba(0, 0, 0, 0.1);
  //   cursor: pointer;
  // }

  // .clicked {
  //   background-color: rgba(0, 0, 0, 0.1);
  //   border: 2px solid #000;
  // }

  // .property-info {
  //   position: absolute;
  //   font-size: 10px;
  //   top: 0;
  //   right: 0;
  // }
  // :global(.vector-expression-card-content) {
  //   display: flex;
  //   justify-content: center;
  //   align-items: center;
  //   height: 100%;
  //   width: 100%;
  // }

  // :global(.text-centered) {
  //   font-size: 10px;
  //   text-align: center;
  //   vertical-align: middle;
  //   word-break: break-word;
  //   width: 90%;
  //   height: fit-content;
  // }
</style>
