<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import type { TreeNode } from '$lib/types'

  import { downloadFile } from '$lib/helper'

  export let node: TreeNode

  const handleEnterKeyForDownload = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      downloadFile(node.url)
    }
  }
</script>

{#if node.isRaster}
  <div
    class="icon"
    alt="Download Layer Data"
    style="cursor: pointer;"
    title="Download Layer Data"
    on:click={() => downloadFile(node.url)}
    on:keydown={handleEnterKeyForDownload}>
    <Wrapper>
      <Fa icon={faDownload} size="sm" />
      <Tooltip showDelay={0} hideDelay={100} yPos="above">Download Layer Data</Tooltip>
    </Wrapper>
  </div>
{/if}

<style lang="scss">
</style>
