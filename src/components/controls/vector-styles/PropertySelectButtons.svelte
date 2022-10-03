<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  export let layer
  export let propertySelectValue
  export let showEmptyFields = false
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
    dispatch('click')
  }

  $: propertySelectValue, propertyChanged()
</script>

<div class="grid" role="menu" on:click={handleClick}>
  {#if propertySelectOptions}
    {#each propertySelectOptions as propertySelectOption}
      <div
        class="card grid-item vector-property-card {propertySelectOption === propertySelectValue ? 'clicked' : null}"
        on:click={() => (propertySelectValue = propertySelectOption)}>
        <div class="vector-expression-card-content">
          <span class="text-centered">{propertySelectOption}</span>
        </div>
      </div>
    {/each}
  {/if}
</div>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 2px;
    padding: 2px;
  }
  .grid-item {
    cursor: pointer;
    text-align: center;
  }
  .button-text {
    width: 99%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  :global(.vector-property-card) {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 50px;
  }

  .vector-property-card:hover {
    background-color: rgba(0, 0, 0, 0.1);
    cursor: pointer;
  }

  .clicked {
    background-color: rgba(0, 0, 0, 0.1);
    border: 2px solid #000;
  }

  :global(.vector-expression-card-content) {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
  }

  :global(.text-centered) {
    font-size: 10px;
    text-align: center;
    vertical-align: middle;
    word-break: break-word;
    width: 90%;
    height: fit-content;
  }
</style>
