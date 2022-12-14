<script lang="ts">
  import { getLayerProperties } from '$lib/helper'
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { map } from '$stores'

  export let layer
  export let propertySelectValue
  export let showEmptyFields = false
  export let showOnlyNumberFields = false
  export let inLegend = false

  let propertySelectOptions: string[]

  const dispatch = createEventDispatcher()

  onMount(() => {
    inLegend && !propertySelectOptions ? setPropertyList() : null
    !inLegend ? setPropertyList() : null
  })

  function setPropertyList() {
    const vectorLayerMeta = getLayerProperties($map, layer, showOnlyNumberFields)
    propertySelectOptions = Object.keys(vectorLayerMeta.fields)
    if (showEmptyFields === true) {
      propertySelectOptions = ['', ...propertySelectOptions]
    }
    propertySelectValue = setDefaultProperty(propertySelectOptions)
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

  $: propertySelectValue, propertyChanged()
</script>

<!--<div style="width: 100%; display: flex; align-items: center; justify-content: left; margin: auto">-->
<div class="control has-icons-left">
  <div
    style="margin-right: 2%"
    class="select is-flex is-justify-content-left select is-normal">
    <select
      style="width: 100%"
      class="is-normal"
      bind:value={propertySelectValue}
      alt="Property Options"
      title="Property Options">
      {#if propertySelectOptions}
        {#each propertySelectOptions as propertySelectOption}
          <option
            class="legend-text"
            alt="Property Option"
            title="Property Option"
            value={propertySelectOption}>{propertySelectOption}</option>
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

<!--</div>-->
<style lang="scss">
</style>
