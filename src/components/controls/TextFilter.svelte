<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { debounce } from 'lodash-es'
  import { clickOutside } from 'svelte-use-click-outside'
  import { SortingColumns } from '$lib/constants'
  import type { DataOrderType, DataSortingColumn } from '$lib/types'
  import PanelButton from './PanelButton.svelte'
  import type { Map } from 'maplibre-gl'
  import TagFilter from './TagFilter.svelte'
  import type { Tag } from '$lib/types/Tag'

  const dispatch = createEventDispatcher()

  export let map: Map
  export let placeholder: string
  let query = ''
  let queryType: 'and' | 'or' = 'and'
  export let sortingColumn: DataSortingColumn = 'name'
  export let orderType: DataOrderType = 'asc'
  export let bbox: [number, number, number, number]

  export let isFilterByBBox: boolean
  export let height: number
  export let selectedTags: Tag[]
  export let tagFilterOperatorType: 'and' | 'or'
  export let currentSearchUrl: string
  let tags: { [key: string]: Tag[] }

  $: sortIcon = orderType === 'asc' ? 'fas fa-arrow-down-short-wide' : 'fas fa-arrow-up-short-wide'

  $: isQueryEmpty = !query || query?.length === 0
  $: queryType, handleQueryTypeChanged()
  $: sortingColumn, fireChangeEvent('change', true)
  $: orderType, fireChangeEvent('change', true)
  const handleQueryTypeChanged = () => {
    if (query === '') return
    fireChangeEvent('change', true)
  }

  const handleFilterInput = debounce((e) => {
    let query = (e.target as HTMLInputElement).value
    fireChangeEvent('change', true)
  }, 500)

  const clearInput = () => {
    if (isQueryEmpty === true) return
    clear()
    fireChangeEvent('clear')
  }

  export const clear = () => {
    query = ''
  }

  const fireChangeEvent = (eventName: 'change' | 'clear', isNormalise = false) => {
    let _query = query
    if (isNormalise) {
      if (query.length > 0) {
        _query = _query.trim().replace(/\s/g, ` ${queryType} `)
      }
    }
    dispatch(eventName, {
      query: _query,
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

<div
  class="filter-text"
  bind:clientHeight={height}>
  <div class="control has-icons-left filter-text-box">
    <input
      data-testid="filter-bucket-input"
      class="input"
      type="text"
      {placeholder}
      on:input={handleFilterInput}
      bind:value={query} />
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
    icon="fas fa-sliders"
    width="230px">
    <p class="title is-5 m-0 p-0 pb-1">Explore by tags</p>
    <p class="has-text-weight-semibold">Explore tags and filter data by selecting them.</p>
    <TagFilter
      bind:selectedTags
      bind:operatorType={tagFilterOperatorType}
      bind:currentSearchUrl />
  </PanelButton>

  <PanelButton
    bind:icon={sortIcon}
    width="200px">
    <p class="title is-5 m-0 p-0">Sort settings</p>

    <p class="subtitle is-6 pb-0 pt-2 my-1">Sort by</p>

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

    <p class="subtitle is-6 pb-0 pt-2 my-1">Ordering</p>

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

  <PanelButton
    icon="fas fa-gear"
    width="230px">
    <p class="title is-5 m-0 p-0">Search settings</p>
    <p class="subtitle is-6 pb-0 pt-2 my-1">Text search</p>

    <div class="tile is-vertical">
      <div class="tile">
        <label class="radio">
          <input
            class="radio-button"
            type="radio"
            name="queryType"
            bind:group={queryType}
            value="and" />
          Match all words typed
        </label>
      </div>
      <div class="tile">
        <label class="radio">
          <input
            class="radio-button"
            type="radio"
            name="queryType"
            bind:group={queryType}
            value="or" />
          Match at least a word typed
        </label>
      </div>
    </div>
    <p class="subtitle is-6 pb-0 pt-2 my-1">Geospatial filter</p>
    <div class="form-check">
      <input
        type="checkbox"
        id="bbox-filter-checkbox"
        name="bbox-filter-checkbox"
        bind:checked={isFilterByBBox} />
      <label for="bbox-filter-checkbox">Filter by current map extent</label>
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
