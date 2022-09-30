<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import { fade } from 'svelte/transition'

  export let layer
  export let propertySelectValue
  export let showEmptyFields = false
  export let showOnlyNumberFields = false
  export let inLegend = false

  let showMenu = false
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
<!--<div class="control has-icons-left">-->
<!--  <div style="margin-right: 2%" class="select is-flex is-justify-content-left select is-small">-->
<!--    <select-->
<!--      style="width: 100%"-->
<!--      class="is-small"-->
<!--      bind:value={propertySelectValue}-->
<!--      alt="Property Options"-->
<!--      title="Property Options">-->
<!--      {#if propertySelectOptions}-->
<!--        {#each propertySelectOptions as propertySelectOption}-->
<!--          <option class="legend-text" alt="Property Option" title="Property Option" value={propertySelectOption}-->
<!--          >{propertySelectOption}</option>-->
<!--        {/each}-->
<!--      {/if}-->
<!--    </select>-->
<!--  </div>-->
<!--  <span class="icon is-small is-left">-->
<!--    <i style="color:black" class="fas fa-table-list" />-->
<!--  </span>-->
<!--</div>-->
<div class="dropdown is-active" style="width: 30%">
  <div class="dropdown-trigger" style="width: 100%">
    <button
      style="width: 100%;"
      on:click={() => (showMenu = !showMenu)}
      class="button"
      aria-haspopup="true"
      aria-controls="dropdown-menu">
      <span class="button-text">{propertySelectValue ? propertySelectValue : 'Select Property'}</span>
      {#if showMenu}
        <span class="icon is-small">
          <i class="fas fa-angle-up" aria-hidden="true" />
        </span>
      {:else}
        <span class="icon is-small">
          <i class="fas fa-angle-down" aria-hidden="true" />
        </span>
      {/if}
    </button>
  </div>
  {#if showMenu}
    <div transition:fade class="dropdown-menu" id="dropdown-menu" role="menu">
      <div class="dropdown-content">
        {#if propertySelectOptions}
          {#each propertySelectOptions as propertySelectOption}
            <div style="display: flex; justify-content: center; align-items: center">
              <div style="margin-left:10%;">
                {#if propertySelectValue === propertySelectOption}
                  <i class="fas fa-check" />
                {/if}
              </div>
              <div style="width: 80%">
                <a
                  on:click={() => {
                    propertySelectValue = propertySelectOption
                    showMenu = false
                  }}
                  class="dropdown-item">
                  {propertySelectOption}
                </a>
              </div>
            </div>
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .button-text {
    width: 99%;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }
</style>
