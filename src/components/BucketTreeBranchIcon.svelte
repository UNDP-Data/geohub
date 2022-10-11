<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'

  const dispatch = createEventDispatcher()

  export let isLoading = false
  export let level = 0
  export let IsExpanded = false

  const toggleExpansion = () => {
    dispatch('toggleExpansion')
  }
</script>

<a class="tree-icon" href="#" role="button" on:click={() => toggleExpansion()}>
  {#if isLoading === true}
    <Fa icon={faSync} size="sm" spin />
  {:else if level === 0}
    <Fa icon={faDatabase} size="sm" style="cursor: pointer;" />
  {:else if !IsExpanded}
    <Fa icon={faChevronRight} size="sm" style="cursor: pointer;" />
  {:else}
    <Fa icon={faChevronRight} size="sm" style="cursor: pointer; transform: rotate(90deg);" />
  {/if}
</a>

<style lang="scss">
  .tree-icon {
    margin-right: 5px;
    color: gray;
    margin-left: 5px;

    @media (prefers-color-scheme: dark) {
      color: rgb(138, 20, 20);
    }
  }
</style>
