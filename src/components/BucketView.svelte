<script lang="ts">
  import { cloneDeep } from 'lodash'
  import type { Bucket, TreeNode } from '$lib/types'

  import BucketCard from '$components/BucketCard.svelte'
  import BucketTreeNode from '$components/BucketTreeNode.svelte'
  import { bucketList, treeBucket } from '$stores'

  const handleBucketClick = async (event: CustomEvent) => {
    const bucketClone: Bucket = cloneDeep(event.detail.bucket)
    bucketClone.selected = !bucketClone.selected
    const bucketIndex = $bucketList.findIndex((node) => node.id === bucketClone.id)
    $bucketList[bucketIndex] = bucketClone

    let treeBucketClone = cloneDeep($treeBucket)
    const isBucketInTree = treeBucketClone.some((node) => node.path === bucketClone.path)

    if (isBucketInTree === false) {
      treeBucketClone = [
        ...treeBucketClone,
        {
          id: bucketClone.id,
          children: [],
          isRaster: false,
          label: bucketClone.path.slice(0, -1),
          path: bucketClone.path,
        },
      ]
    } else {
      treeBucketClone = treeBucketClone.filter((node) => node.path !== bucketClone.path)
    }

    treeBucketClone.sort((a, b) => a.label.localeCompare(b.label))
    $treeBucket = treeBucketClone
  }
</script>

<div class="view-container" data-testid="view-container">
  <div class="columns">
    <div class="column cards">
      {#each $bucketList as bucket}
        <BucketCard {bucket} on:click={handleBucketClick} />
      {/each}
    </div>
    <div class="column is-four-fifths tree">
      {#each $treeBucket as tree}
        <ul>
          <BucketTreeNode bind:node={tree} />
        </ul>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .view-container {
    padding-right: 30px;
  }
</style>
