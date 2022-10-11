<script lang="ts">
  import { slide } from 'svelte/transition'
  import type { TreeNode } from '$lib/types'

  import BucketTreeItemRaster from './BucketTreeItemRaster.svelte'
  import BucketTreeItemVector from './BucketTreeItemVector.svelte'

  export let tree: TreeNode
  export let loadingLayer = false
  export let expanded = false
</script>

{#if !tree.children}
  <div class="node-container" transition:slide={{ duration: expanded ? 0 : 350 }}>
    {#if tree.isRaster}
      <BucketTreeItemRaster bind:tree bind:loadingLayer />
    {:else}
      <BucketTreeItemVector bind:tree bind:loadingLayer />
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
