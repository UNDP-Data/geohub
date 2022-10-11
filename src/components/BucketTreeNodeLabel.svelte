<script lang="ts">
  import { clean } from '$lib/helper'
  import type { TreeNode } from '$lib/types'

  export let node: TreeNode
</script>

<div class="name">
  {#if node.isRaster}
    {#if node.children}
      {clean(node.label)}
    {:else if node.isStac}
      {clean(
        node.path
          .split('/')
          .pop()
          .replace(/\.[^/.]+$/, ''),
      )}
    {:else}
      {clean(node.label)}
    {/if}
  {:else}
    {clean(node.label)}
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
