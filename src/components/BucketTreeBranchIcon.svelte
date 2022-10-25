<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'

  const dispatch = createEventDispatcher()

  export let level = 0
  export let IsExpanded = false

  const toggleExpansion = () => {
    dispatch('toggleExpansion')
  }
</script>

<div
  class="tree-icon"
  on:click={() => toggleExpansion()}>
  {#if level === 0}
    <Fa
      icon={faDatabase}
      size="sm"
      style="cursor: pointer;" />
  {:else if !IsExpanded}
    <Fa
      icon={faChevronRight}
      size="sm"
      style="cursor: pointer;" />
  {:else}
    <Fa
      icon={faChevronRight}
      size="sm"
      style="cursor: pointer; transform: rotate(90deg);" />
  {/if}
</div>

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
