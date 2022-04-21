<script lang="ts">
  import { cloneDeep } from 'lodash'
  import type { Bucket } from '$lib/types'

  import BucketCard from '$components/BucketCard.svelte'
  import BucketTreeNode from '$components/BucketTreeNode.svelte'
  import { bucketList, treeBucket } from '$stores'

  const handleBucketClick = async (event: CustomEvent) => {
    const bucketClone: Bucket = cloneDeep(event.detail.bucket)
    bucketClone.selected = !bucketClone.selected
    const bucketIndex = $bucketList.findIndex((bucket) => bucket.id === bucketClone.id)
    $bucketList[bucketIndex] = bucketClone

    const tree = cloneDeep($treeBucket)
    const isBucketInTree = tree.tree.children.some((item) => item.path === bucketClone.path)

    if (isBucketInTree === false) {
      tree.tree.children = [
        ...tree.tree.children,
        {
          id: bucketClone.id,
          children: [],
          isRaster: false,
          label: bucketClone.path.slice(0, -1),
          path: bucketClone.path,
        },
      ]
    } else {
      tree.tree.children = tree.tree.children.filter((item) => item.path !== bucketClone.path)
    }

    tree.tree.children.sort((a, b) => a.label.localeCompare(b.label))
    $treeBucket = tree
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
      <ul>
        <BucketTreeNode bind:node={$treeBucket.tree} />
      </ul>
    </div>
  </div>
</div>

<style lang="scss">
  .view-container {
    padding-right: 30px;
  }
</style>
