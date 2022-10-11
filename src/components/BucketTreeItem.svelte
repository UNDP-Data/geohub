<script lang="ts">
  import { slide } from 'svelte/transition'
  import type { TreeNode } from '$lib/types'

  import BucketTreeItemRaster from './BucketTreeItemRaster.svelte'
  import BucketTreeItemVector from './BucketTreeItemVector.svelte'

  import { indicatorProgress } from '$stores'

  export let tree: TreeNode
  export let isLoading = false
  export let IsExpanded = false

  const setProgressIndicator = (state: boolean) => {
    isLoading = state
    $indicatorProgress = state
  }
</script>

{#if !tree.children}
  <div class="node-container" transition:slide={{ duration: IsExpanded ? 0 : 350 }}>
    {#if tree.isRaster}
      <BucketTreeItemRaster bind:tree bind:isLoading {setProgressIndicator} />
    {:else}
      <BucketTreeItemVector bind:tree bind:isLoading {setProgressIndicator} />
    {/if}
  </div>
{/if}

<style lang="scss">
  .node-container {
    align-items: center;
    display: flex;
    height: auto;
    justify-content: left;
  }
</style>
