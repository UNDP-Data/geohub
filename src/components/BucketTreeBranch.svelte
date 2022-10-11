<script lang="ts">
  import { slide } from 'svelte/transition'

  import type { TreeNode } from '$lib/types'

  import { STAC_PAGINATION_PREV, STAC_PAGINATION_NEXT } from '$lib/constants'
  import { indicatorProgress } from '$stores'

  import BucketTreeNodeLabel from './BucketTreeNodeLabel.svelte'
  import BucketTreeBranchCloseButton from './BucketTreeBranchCloseButton.svelte'
  import BucketTreeBranchIcon from './BucketTreeBranchIcon.svelte'
  import BucketTreeBranchPagination from './BucketTreeBranchPagination.svelte'
  import { fetchUrl } from '$lib/helper'

  export let tree: TreeNode
  export let expanded = false
  export let level = 0
  export let loadingLayer = false
  export let handleRemoveBucket = () => {
    throw new Error('Please give the function from the parent component')
  }
  export let toggleExpansion = () => {
    throw new Error('Please give the function from the parent component')
  }

  $: if (expanded) {
    if (tree?.children.length === 0) updateTreeStore()
  }

  let stacPaginationAction = ''
  let stacPaginationLabel = ''

  const handleStacPagination = (event) => {
    const action = event.detail.action
    stacPaginationAction = action

    if (action === STAC_PAGINATION_PREV) {
      stacPaginationLabel = tree.children[0].label
    } else if (action === STAC_PAGINATION_NEXT) {
      stacPaginationLabel = tree.children[tree.children.length - 1].label
    }

    updateTreeStore()
  }

  const setProgressIndicator = (state: boolean) => {
    loadingLayer = state
    $indicatorProgress = state
  }

  const updateTreeStore = async () => {
    setProgressIndicator(true)
    let treeData: { tree: TreeNode }

    if (tree.isStac) {
      const catalogId = tree.path.split('/')[0]
      treeData = await fetchUrl(
        `stac.json?id=${catalogId}&path=${tree.path}&token=${stacPaginationAction}&item=${stacPaginationLabel
          .split('/')
          .pop()
          .replace(/\.[^/.]+$/, '')}`,
      )
    } else if (tree.isMartin) {
      treeData = await fetchUrl(
        `martin.json?path=${tree.path}&label=${tree.label}${tree.url === null ? '&isschema=true' : ''}`,
      )
    } else {
      treeData = await fetchUrl(`azstorage.json?path=${tree.path}`)
    }

    if (treeData) {
      //set  node value to the result of the fetch. This will actualy work becauase the tree is recursive
      // TODO: evaluate if the  node should be assigned at ethe end of this function. This would allow to remove
      // potentially invalid layers from the tree!!!!
      tree = treeData.tree
    }

    setProgressIndicator(false)
  }
</script>

{#if tree.children}
  <div class="node-container" transition:slide={{ duration: expanded ? 0 : 350 }}>
    <BucketTreeBranchIcon bind:loadingLayer bind:level bind:expanded on:toggleExpansion={toggleExpansion} />
    <BucketTreeNodeLabel bind:node={tree} />

    {#if level === 0}
      <BucketTreeBranchCloseButton on:remove={handleRemoveBucket} />
    {/if}
  </div>
{/if}
{#if expanded && level > 0 && tree.isRaster && tree.isStac}
  <BucketTreeBranchPagination
    disabledPrev={tree.paginationDirectionDisabled === STAC_PAGINATION_PREV}
    disabledNext={tree.paginationDirectionDisabled === STAC_PAGINATION_NEXT}
    on:pagination={handleStacPagination} />
{/if}

<style lang="scss">
  .node-container {
    align-items: center;
    display: flex;
    height: auto;
    justify-content: left;
  }
</style>
