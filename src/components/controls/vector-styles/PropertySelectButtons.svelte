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
    if (propertySelectValue === '') return
    dispatch('click')
  }

  $: propertySelectValue, propertyChanged()
</script>

<div class="grid" role="menu" on:click={handleClick}>
  {#if propertySelectOptions}
    {#each propertySelectOptions as propertySelectOption}
      <div
        class="card grid-item p-0 m-0  {propertySelectOption === propertySelectValue
          ? 'has-background-success '
          : 'has-background-info-dark'}"
        on:click={() => (propertySelectValue = propertySelectOption)}>
        <div class="card-header is-size-6 is-shadowless">
          <span
            class="card-header-title is-centered pb-2 pt-2 m-0 {propertySelectOption === propertySelectValue
              ? 'has-text-success-darker'
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
            {#if layer.info.json.vector_layers[0].fields[propertySelectOption] === 'Number'}
              ::numeric::
            {:else}
              ::text::
            {/if}
          </span>
        </div>
      </div>
    {/each}
  {/if}
</div>

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 15px;
    padding: 0px;
  }
  .grid-item {
    cursor: pointer;
    text-align: center;
  }

  .fa-spell-check {
    position: absolute;
    top: 0;
    right: 0;
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

  .property-info {
    position: absolute;
    font-size: 10px;
    top: 0;
    right: 0;
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
