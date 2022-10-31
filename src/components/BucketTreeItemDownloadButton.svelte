<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import type { TreeNode } from '$lib/types'

  import { downloadFile } from '$lib/helper'

  export let tree: TreeNode

  const handleEnterKeyForDownload = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      downloadFile(tree.url)
    }
  }
</script>

{#if tree.isRaster}
  <div
    class="icon"
    alt="Download Layer Data"
    style="cursor: pointer;"
    title="Download Layer Data"
    on:click={() => downloadFile(tree.url)}
    on:keydown={handleEnterKeyForDownload}>
    <Wrapper>
      <Fa
        icon={faDownload}
        size="sm" />
      <Tooltip
        showDelay={0}
        hideDelay={100}
        yPos="above">Download Layer Data</Tooltip>
    </Wrapper>
  </div>
{/if}

<style lang="scss">
</style>
