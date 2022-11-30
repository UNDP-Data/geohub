<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { debounce } from 'lodash-es'
  import { clickOutside } from 'svelte-use-click-outside'

  const dispatch = createEventDispatcher()

  export let placeholder: string
  let queryText = ''
  let queryType: 'and' | 'or' = 'and'
  export let sortingColumn: 'name' | 'source' | 'license' | 'createdat' | 'updatedat' = 'name'
  export let orderType: 'asc' | 'desc' = 'asc'

  const sortingColumns = [
    {
      column: 'name',
      label: 'Name',
    },
    {
      column: 'source',
      label: 'Source',
    },
    // {
    //   column: 'license',
    //   label: 'Data license'
    // },
    {
      column: 'updatedat',
      label: 'Updated date',
    },
    {
      column: 'createdat',
      label: 'Created date',
    },
  ]

  let isFilterPanelOpen = false
  let isSortPanelOpen = false

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
    })
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

  <div class="filter-control">
    <button
      class="button"
      on:click={() => (isFilterPanelOpen = !isFilterPanelOpen)}>
      <span class="icon is-small">
        <i class="fas fa-filter" />
      </span>
    </button>
    {#if isFilterPanelOpen}
      <div
        class="filter-panel container p-4"
        use:clickOutside={() => (isFilterPanelOpen = false)}>
        <p class="title is-5 is-12">Filter settings</p>
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
        </div>
      </div>
    {/if}
  </div>

  <div class="sort-control">
    <button
      class="button"
      on:click={() => (isSortPanelOpen = !isSortPanelOpen)}>
      <span class="icon is-small">
        <i class="fa-solid {orderType === 'asc' ? 'fa-arrow-down-short-wide' : 'fa-arrow-up-short-wide'}" />
      </span>
    </button>

    {#if isSortPanelOpen}
      <div
        class="sort-panel container p-4"
        use:clickOutside={() => (isSortPanelOpen = false)}>
        <p class="title is-5 is-12">Sort settings</p>

        <p class="subtitle is-6 pb-0 mb-1">Sort by:</p>

        <div class="tile is-vertical">
          {#each sortingColumns as column}
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

        <p class="subtitle is-6 pb-0 mb-1">Ordering:</p>

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
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/radio.min.css';

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

    .filter-control {
      position: relative;
      margin-left: 0.2rem;

      .filter-panel {
        position: absolute;
        background-color: white;
        margin-top: 5px;
        width: 200px;
        top: 32.5px;
        right: 0px;
        border: 1px solid gray;
        border-radius: 5px;
        z-index: 10;

        .query-type-radios {
          display: flex;

          .radio-button {
            position: relative;
            top: 0.2rem;
          }
        }
      }
    }

    .sort-control {
      position: relative;
      margin-left: 0.2rem;

      .sort-panel {
        position: absolute;
        background-color: white;
        margin-top: 5px;
        width: 200px;
        top: 32.5px;
        right: 0px;
        border: 1px solid gray;
        border-radius: 5px;
        z-index: 10;

        .radio-button {
          position: relative;
          top: 0.2rem;
        }
      }
    }
  }
</style>
