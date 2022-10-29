<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { clean } from '$lib/helper'
  export let layer
  export let propertySelectValue
  export let showEmptyFields = false //this needs to be removed TODO
  export let showOnlyNumberFields = false
  export let inLegend = false
  let propertySelectOptions = inLegend ? layer.intervals.propertyOptions : undefined

  const dispatch = createEventDispatcher()

  onMount(() => {
    inLegend && !propertySelectOptions ? setPropertyList() : null
    !inLegend ? setPropertyList() : null
  })



  

  function setPropertyList() {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    propertySelectOptions = layer.info.json.tilestats.layers[0].attributes.map(e=>e.attribute)
    if(showOnlyNumberFields) {
      propertySelectOptions = layer.info.json.tilestats.layers[0].attributes.map((el:Object)=> {
        if (el['type'] === 'number'){
          return el
        }
      })
    }


    inLegend ? (layer.intervals.propertyOptions = propertySelectOptions) : null
    
    propertyChanged()
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

<div
  style="max-height: 200px; overflow-y: auto"
  class="grid-wrapper "
  role="menu"
  on:click={handleClick}>
  {#if propertySelectOptions}
    {#each propertySelectOptions as propertySelectOption}
        {@const propertyProps = layer.info.json.tilestats.layers[0].attributes.find((e) => {return e['attribute'] === propertySelectOption})}
        
        <div
          class="grid-item card  m-10 is-info is-clickable  has-text-centered "
          on:click={() => {
            propertySelectValue = propertySelectOption
            handleClick
          }}
          title={propertyProps['type'] === 'string'
            ? `${clean(propertySelectOption)}, text property`
            : ` ${clean(propertySelectOption)}, numeric property`}>
          <div
            class="card-header is-size-6  pb-0 pt-0 m-0 {propertySelectValue === propertySelectOption
              ? 'has-background-success'
              : 'has-background-info-dark'} ">
            <span
              class="card-header-title grid-item is-centered is-v-centered {propertySelectValue === propertySelectOption
                ? 'has-text-white-ter'
                : 'has-text-white-ter'}  ">
              {#if propertySelectOption === propertySelectValue}
                <span class="icon ">
                  <i class="fa-solid fa-check" />
                </span>
              {/if}
              {clean(propertySelectOption)}
            </span>
          </div>
          <div class="content ">
            {#if propertyProps['type'] === 'string'}
              <span class="box has-text-danger-dark is-size-7 has-text-weight-bold">
                <i class="fa-solid fa-a" />...<i class="fa-solid fa-z" />
              </span>
            {:else}
              <span class="box has-text-danger-dark is-size-7 has-text-weight-bold">
                <i class="fa-solid fa-1" />...<i class="fa-solid fa-9" />
              </span>
            {/if}
          </div>
        </div>
    {/each}
  {/if}
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


</style>
