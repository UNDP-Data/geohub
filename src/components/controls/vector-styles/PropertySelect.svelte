<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  export let layer

  const metadata = layer.info
  const layerI = metadata.json.tilestats.layers.find((l) => l.layer === layer.definition['source-layer'])

  const propertySelectOptions = layerI['attributes'].map((attr) => attr.attribute)
  const dispatch = createEventDispatcher()
  let propertySelectValue: string = null

  const propertyChanged = () => {
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

<div class="is-size-7 has-text-weight-semibold" style="padding: 2px">Property:</div>
<div class="select is-rounded is-flex is-justify-content-left" style="width: 80%;">
  <select
    style="width: 100%"
    class="is-small"
    bind:value={propertySelectValue}
    alt="Property Options"
    title="Property Options">
    {#each propertySelectOptions as propertySelectOption}
      <option class="legend-text" alt="Property Option" title="Property Option" value={propertySelectOption}
        >{propertySelectOption}</option>
    {/each}
  </select>
</div>

<style lang="scss">
</style>
