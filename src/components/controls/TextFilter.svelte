<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { debounce } from 'lodash-es'

  const dispatch = createEventDispatcher()

  export let placeholder: string
  let queryText = ''
  let queryType: 'and' | 'or' = 'and'
  $: isQueryEmpty = !queryText || queryText?.length === 0
  $: queryType,
    () => {
      if (queryText.length === 0) return
      normaliseQuery(queryText)
    }

  const handleFilterInput = debounce((e) => {
    let query = (e.target as HTMLInputElement).value
    normaliseQuery(query)
  }, 500)

  const normaliseQuery = (query: string) => {
    if (query.length > 0) {
      query = query.trim().replace(/\s/g, ` ${queryType} `)
    }

    dispatch('change', {
      query: query,
    })
  }

  const clearInput = () => {
    if (isQueryEmpty === true) return
    queryText = ''
    dispatch('clear')
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

  <!-- <div class="query-type-radios"> -->
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
  <!-- </div> -->
</div>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/radio.min.css';

  .filter-text {
    display: flex;
    padding-left: 1em;
    padding-right: 1em;

    .filter-text-box {
      position: relative;
      height: 35px;
      width: 70%;

      .clear-button {
        position: absolute;
        top: 6px;
        right: 8px;
        cursor: pointer;
      }
    }

    .query-type-radios {
      display: flex;
      margin-top: 0.5rem;
      margin-left: 1rem;

      .radio-button {
        position: relative;
        top: 0.2rem;
      }
    }
  }
</style>
