<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let propertySelectValue
  export let showEmptyFields = false
  export let propertySelectOptions

  let selectedIndex = []
  let disabled
  const dispatch = createEventDispatcher()

  const propertyChanged = () => {
    selectedIndex = [...selectedIndex, propertySelectOptions.indexOf(propertySelectValue)]
    disabled = selectedIndex.indexOf(propertySelectValue) < -1 ? 'false' : 'false'

    dispatch('select', {
      prop: propertySelectValue,
    })
  }

  $: {
    if (propertySelectValue !== null) {
      propertySelectValue, propertyChanged()
    }
  }
</script>

<div style="width: 100%; display: flex; align-items: center; justify-content: left; margin: auto">
  <div class="select is-rounded is-flex is-justify-content-left">
    <select
      style="width: 100%"
      class="is-small"
      bind:value={propertySelectValue}
      alt="Property Options"
      title="Property Options">
      {#if showEmptyFields}
        <option class="legend-text" alt="Property Option" title="Property Option" value={''} />
      {/if}
      {#each propertySelectOptions as propertySelectOption}
        <option class="legend-text" alt="Property Option" title="Property Option" value={propertySelectOption}
          >{propertySelectOption}</option>
      {/each}
    </select>
  </div>
</div>

<style lang="scss">
</style>
