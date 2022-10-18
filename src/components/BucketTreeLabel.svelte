<script lang="ts">
  import { clean } from '$lib/helper'
  import type { TreeNode } from '$lib/types'

  export let tree: TreeNode
</script>

<div class="name">
  {#if tree.isRaster}
    {#if tree.children}
      {clean(tree.label)}
    {:else if tree.isStac}
      {#if tree.isMosaicJSON}
        {clean(tree.label)}
      {:else}
        {clean(
          tree.path
            .split('/')
            .pop()
            .replace(/\.[^/.]+$/, ''),
        )}
      {/if}
    {:else}
      {clean(tree.label)}
    {/if}
  {:else}
    {clean(tree.label)}
  {/if}
</div>

<style lang="scss">
  .name {
    overflow: hidden;
    padding-left: 5px;
    text-overflow: ellipsis;
    width: 100%;

    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }
</style>
