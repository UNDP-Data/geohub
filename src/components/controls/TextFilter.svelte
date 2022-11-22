<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { debounce } from 'lodash-es'

  const dispatch = createEventDispatcher()

  export let placeholder: string
  let queryText = ''

  const handleFilterInput = debounce((e) => {
    const inputString = (e.target as HTMLInputElement).value

    dispatch('change', {
      query: inputString,
    })
  }, 500)

  const clearInput = () => {
    queryText = ''
    dispatch('clear')
  }
</script>

<div class="filter-text">
  <div class="control has-icons-left has-icons-right">
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
  </div>
  <span
    class="icon is-small clear-button"
    on:click={clearInput}>
    <i class="fas fa-xmark" />
  </span>
</div>

<style lang="scss">
  .filter-text {
    padding-left: 1em;
    padding-right: 1em;

    .clear-button {
      position: absolute;
      top: 10px;
      right: 1.5em;
      cursor: pointer;
    }
  }
</style>
