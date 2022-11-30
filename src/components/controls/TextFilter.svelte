<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { debounce } from 'lodash-es'
  import { clickOutside } from 'svelte-use-click-outside'
  import { SortingColumns } from '$lib/constants'
  import type { DataOrderType, DataSortingColumn } from '$lib/types'
  import PanelButton from './PanelButton.svelte'
  import type { Map } from 'maplibre-gl'

  const dispatch = createEventDispatcher()

  export let map: Map
  export let placeholder: string
  let queryText = ''
  let queryType: 'and' | 'or' = 'and'
  export let sortingColumn: DataSortingColumn = 'name'
  export let orderType: DataOrderType = 'asc'
  export let bbox: [number, number, number, number]

  export let isFilterByBBox: boolean

  $: sortIcon = orderType === 'asc' ? 'fas fa-arrow-down-short-wide' : 'fas fa-arrow-up-short-wide'

  $: isQueryEmpty = !queryText || queryText?.length === 0
  $: queryType, handleQueryTypeChanged()
  $: sortingColumn, fireChangeEvent('change', true)
  $: orderType, fireChangeEvent('change', true)
  const handleQueryTypeChanged = () => {
    if (queryText === '') return
    fireChangeEvent('change', true)
  }

  const handleFilterInput = debounce((e) => {
    let query = (e.target as HTMLInputElement).value
    fireChangeEvent('change', true)
  }, 500)

  const clearInput = () => {
    if (isQueryEmpty === true) return
    queryText = ''
    fireChangeEvent('clear')
  }

  const fireChangeEvent = (eventName: 'change' | 'clear', isNormalise = false) => {
    let query = queryText
    if (isNormalise) {
      if (query.length > 0) {
        query = query.trim().replace(/\s/g, ` ${queryType} `)
      }
    }
    dispatch(eventName, {
      query: query,
      sortingColumn,
      orderType,
      bbox,
    })
  }

  $: isFilterByBBox, registerMapMovedEvent()

  const registerMapMovedEvent = () => {
    if (!map) return
    if (isFilterByBBox) {
      map.off('moveend', handleMapMoved)
      map.on('moveend', handleMapMoved)
    } else {
      map.off('moveend', handleMapMoved)
    }
    handleMapMoved()
  }

  const handleMapMoved = () => {
    if (!map) return
    if (isFilterByBBox) {
      const bounds = map.getBounds()
      bbox = [
        bounds.getSouthWest().lng,
        bounds.getSouthWest().lat,
        bounds.getNorthEast().lng,
        bounds.getNorthEast().lat,
      ]
    } else {
      bbox = undefined
      map.off('moveend', handleMapMoved)
    }
    fireChangeEvent('change', true)
  }
</script>

<div class="filter-text">
  <div class="control has-icons-left filter-text-box">
    <input
      data-testid="filter-bucket-input"
      class="input"
      type="text"
      {placeholder}
      on:input={handleFilterInput}
      bind:value={queryText} />
    <span class="icon is-small is-left">
      <i class="fas fa-search" />
    </span>
    {#if !isQueryEmpty}
      <span
        class="clear-button"
        on:click={clearInput}>
        <i class="fas fa-xmark sm" />
      </span>
    {/if}
  </div>

  <PanelButton
    icon="fas fa-filter"
    width="230px">
    <p class="title is-5 m-0 p-0">Filter settings</p>
    <p class="subtitle is-6 pb-0 my-1">Text search</p>
    <div class="control query-type-radios">
      <label class="radio">
        <input
          class="radio-button"
          type="radio"
          name="queryType"
          bind:group={queryType}
          value="and" />
        AND
      </label>
      <label class="radio">
        <input
          class="radio-button"
          type="radio"
          name="queryType"
          bind:group={queryType}
          value="or" />
        OR
      </label>
      <p class="subtitle is-6 pb-0 my-1">Geospatial filter</p>
      <div class="form-check">
        <input
          type="checkbox"
          id="bbox-filter-checkbox"
          name="bbox-filter-checkbox"
          bind:checked={isFilterByBBox} />
        <label for="bbox-filter-checkbox">Filter by current map extent</label>
      </div>
    </div>
  </PanelButton>

  <PanelButton
    bind:icon={sortIcon}
    width="200px">
    <p class="title is-5 m-0 p-0">Sort settings</p>

    <p class="subtitle is-6 pb-0 my-1">Sort by</p>

    <div class="tile is-vertical">
      {#each SortingColumns as column}
        <div class="tile">
          <label class="radio">
            <input
              class="radio-button"
              type="radio"
              name="sortby"
              bind:group={sortingColumn}
              value={column.column} />
            {column.label}
          </label>
        </div>
      {/each}
    </div>

    <p class="subtitle is-6 pb-0 my-1">Ordering</p>

    <div class="tile is-vertical">
      <div class="tile">
        <label class="radio">
          <input
            class="radio-button"
            type="radio"
            name="orderby"
            bind:group={orderType}
            value="asc" />
          A to Z (small to large)
        </label>
      </div>
      <div class="tile">
        <label class="radio">
          <input
            class="radio-button"
            type="radio"
            name="orderby"
            bind:group={orderType}
            value="desc" />
          Z to A (large to small)
        </label>
      </div>
    </div>
  </PanelButton>
</div>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/radio.min.css';
  @use '../../styles/undp-design/checkbox.min.css';

  .filter-text {
    display: flex;
    padding-top: 0.5rem;
    padding-left: 1em;
    padding-right: 0.5em;

    .filter-text-box {
      position: relative;
      height: 35px;
      width: 100%;

      .clear-button {
        position: absolute;
        top: 6px;
        right: 8px;
        cursor: pointer;
      }
    }

    .subtitle {
      border-bottom: 1px solid gray;
      font-weight: bold;
    }

    .radio-button {
      position: relative;
      top: 0.2rem;
    }
  }
</style>
