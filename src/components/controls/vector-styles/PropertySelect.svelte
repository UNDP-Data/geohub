<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  export let layer
  export let propertySelectValue
  export let showEmptyFields = false
  export let showOnlyNumberFields = false
  let propertySelectOptions

  const dispatch = createEventDispatcher()

  onMount(() => {
    setPropertyList()
  })

  const setPropertyList = () => {
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

<div style="width: 100%; display: flex; align-items: center; justify-content: left; margin: auto">
  <div class="select is-rounded is-flex is-justify-content-left">
    <select
      style="width: 100%"
      class="is-small"
      bind:value={propertySelectValue}
      alt="Property Options"
      title="Property Options">
      {#if propertySelectOptions}
        {#each propertySelectOptions as propertySelectOption}
          <option class="legend-text" alt="Property Option" title="Property Option" value={propertySelectOption}
            >{propertySelectOption}</option>
        {/each}
      {/if}
    </select>
  </div>
</div>

<style lang="scss">
</style>
