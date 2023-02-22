<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { debounce } from 'lodash-es'
  import { SortingColumns } from '$lib/constants'
  import PanelButton from '$components/controls/PanelButton.svelte'
  import type { Map } from 'maplibre-gl'
  import TagFilter from '$components/data-view/TagFilter.svelte'
  import { Checkbox, Radios, type Radio } from '@undp-data/svelte-undp-design'
  import type { Tag } from '$lib/types/Tag'

  const dispatch = createEventDispatcher()

  export let map: Map
  export let placeholder: string
  export let query = ''
  let queryType: 'and' | 'or' = 'and'
  let queryTypes: Radio[] = [
    {
      label: 'Match all words typed',
      value: 'and',
    },
    {
      label: 'Match at least a word typed',
      value: 'or',
    },
  ]

  export let sortingColumn: string = SortingColumns[0].value

  export let bbox: [number, number, number, number] = undefined

  export let isFilterByBBox: boolean = undefined
  export let selectedTags: Tag[] = undefined
  export let tagFilterOperatorType: 'and' | 'or' = undefined
  export let currentSearchUrl: string = undefined

  $: isQueryEmpty = !query || query?.length === 0
  $: queryType, handleQueryTypeChanged()
  $: sortingColumn, fireChangeEvent('change')
  const handleQueryTypeChanged = () => {
    if (query === '') return
    fireChangeEvent('change')
  }

  const handleFilterInput = debounce(() => {
    fireChangeEvent('change')
  }, 500)

  const clearInput = () => {
    if (isQueryEmpty === true) return
    query = ''
    fireChangeEvent('clear')
  }

  const fireChangeEvent = (eventName: 'change' | 'clear') => {
    dispatch(eventName, {
      query: query,
      queryoperator: queryType,
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
    fireChangeEvent('change')
  }
</script>

<div class="filter-text pt-3">
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
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <span
        class="clear-button"
        on:click={clearInput}>
        <i class="fas fa-xmark sm" />
      </span>
    {/if}
  </div>

  <PanelButton
    icon="fas fa-sliders"
    tooltip="Explore tags and filter data"
    width="230px">
    <p class="title is-5 m-0 p-0 pb-1">Explore by tags</p>
    <p class="has-text-weight-semibold">Explore tags and filter data by selecting them.</p>
    <TagFilter
      bind:selectedTags
      bind:operatorType={tagFilterOperatorType}
      bind:currentSearchUrl />
  </PanelButton>

  <PanelButton
    icon="fas fa-arrow-down-short-wide"
    tooltip="Sort"
    width="200px">
    <p class="title is-5 m-0 p-0 pb-2">Sort settings</p>

    <Radios
      radios={SortingColumns}
      bind:value={sortingColumn}
      groupName="sortby"
      isVertical={true} />
  </PanelButton>

  <PanelButton
    icon="fas fa-gear"
    tooltip="Settings"
    position="left"
    width="230px">
    <p class="title is-5 m-0 p-0">Search settings</p>
    <p class="subtitle is-6 pb-0 pt-2 my-1">Text search</p>

    <Radios
      bind:radios={queryTypes}
      bind:value={queryType}
      groupName="queryType"
      isVertical={true} />
    <p class="subtitle is-6 pb-0 pt-2 my-1">Geospatial filter</p>
    <Checkbox
      label="Filter by current map extent"
      bind:checked={isFilterByBBox} />
  </PanelButton>
</div>

<style lang="scss">
  .filter-text {
    display: flex;

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

    // .radio-button {
    //   position: relative;
    //   top: 0.2rem;
    // }
  }
</style>
