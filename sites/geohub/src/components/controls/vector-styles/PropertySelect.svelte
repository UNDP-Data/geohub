<script lang="ts">
  import { getLayerProperties } from '$lib/helper'
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { map } from '$stores'

  export let layer
  export let propertySelectValue
  export let showEmptyFields = false
  export let inLegend
  export let emptyFieldLabel = 'No Label'

  let propertySelectOptions: string[]

  const dispatch = createEventDispatcher()

  onMount(() => {
    setPropertyList()
  })

  function setPropertyList() {
    const vectorLayerMeta = getLayerProperties($map, layer, inLegend)
    propertySelectOptions = Object.keys(vectorLayerMeta.fields)
    if (showEmptyFields === true) {
      propertySelectOptions = ['', ...propertySelectOptions]
    }
  }

  const propertyChanged = () => {
    dispatch('select', {
      prop: propertySelectValue,
    })
  }
</script>

<div class="control has-icons-left">
  <div
    style="margin-right: 2%"
    class="select is-flex is-justify-content-left select is-normal">
    <select
      style="width: 100%"
      class="is-normal"
      bind:value={propertySelectValue}
      on:change={propertyChanged}
      alt="Property Options"
      title="Property Options">
      {#if propertySelectOptions}
        {#each propertySelectOptions as propertySelectOption}
          <option
            class="legend-text"
            alt="Property Option"
            title="Property Option"
            value={propertySelectOption}>{!propertySelectOption ? emptyFieldLabel : propertySelectOption}</option>
        {/each}
      {/if}
    </select>
  </div>
  <span class="icon is-small is-left">
    <i
      style="color:black"
      class="fas fa-table-list" />
  </span>
</div>

<style lang="scss">
</style>
