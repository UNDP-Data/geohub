<script lang="ts">
  import { page } from '$app/stores'
  import { goto } from '$app/navigation'
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
  export let query = $page.url.searchParams.get('query') ?? ''
  let queryType: 'and' | 'or' = ($page.url.searchParams.get('queryoperator') as 'and' | 'or') ?? 'and'
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

  let sortingColumn: string = $page.url.searchParams.get('sortby') ?? SortingColumns[0].value

  const bboxString = $page.url.searchParams.get('bbox')
  const bboxArray = bboxString?.split(',').map((v) => Number(v))
  let bbox: [number, number, number, number] = bboxString ? (bboxArray as [number, number, number, number]) : undefined

  let isFilterByBBox: boolean = bboxString ? true : false
  export let selectedTags: Tag[] = undefined
  let tagFilterOperatorType: 'and' | 'or'

  $: isQueryEmpty = !query || query?.length === 0
  $: queryType, handleQueryTypeChanged()
  $: sortingColumn, handleSortingColumnChanged()
  $: tagFilterOperatorType, handleTagOperatorChanged()

  const handleTagOperatorChanged = () => {
    const apiUrl = $page.url
    apiUrl.searchParams.delete('operator')
    if (tagFilterOperatorType) {
      apiUrl.searchParams.set('operator', tagFilterOperatorType)
      fireChangeEvent('change', apiUrl.toString())
    }
  }

  const handleSortingColumnChanged = () => {
    const apiUrl = $page.url
    apiUrl.searchParams.delete('sortby')
    apiUrl.searchParams.set('sortby', sortingColumn)
    fireChangeEvent('change', apiUrl.toString())
  }

  const handleQueryTypeChanged = () => {
    const apiUrl = $page.url
    apiUrl.searchParams.delete('queryoperator')
    apiUrl.searchParams.set('queryoperator', queryType)
    fireChangeEvent('change', apiUrl.toString())
  }

  const handleFilterInput = debounce(() => {
    const apiUrl = $page.url
    apiUrl.searchParams.delete('query')
    if (query.length > 0) {
      apiUrl.searchParams.set('query', query)
    }
    fireChangeEvent('change', apiUrl.toString())
  }, 500)

  const clearInput = () => {
    if (isQueryEmpty === true) return
    query = ''

    const apiUrl = $page.url
    apiUrl.searchParams.delete('query')
    fireChangeEvent('clear', apiUrl.toString())
  }

  const fireChangeEvent = async (eventName: 'change' | 'clear', url: string) => {
    await goto(url, {
      replaceState: true,
      noScroll: true,
      keepFocus: true,
      invalidateAll: false,
    })
    dispatch(eventName, {
      query: query,
      queryoperator: queryType,
    })
  }

  $: isFilterByBBox, registerMapMovedEvent()

  const registerMapMovedEvent = async () => {
    if (!map) return
    if (isFilterByBBox) {
      map.off('moveend', handleMapMoved)
      map.on('moveend', handleMapMoved)
    } else {
      map.off('moveend', handleMapMoved)
      bbox = undefined
      const apiUrl = $page.url
      apiUrl.searchParams.delete('bbox')
      await goto(apiUrl.toString())
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
      const apiUrl = $page.url
      apiUrl.searchParams.delete('bbox')
      apiUrl.searchParams.set('bbox', bbox.join(','))
      fireChangeEvent('change', apiUrl.toString())
    }
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
      bind:operatorType={tagFilterOperatorType} />
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
