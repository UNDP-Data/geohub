<script lang="ts">
  import BucketCard from '$components/BucketCard.svelte'
  import BucketTreeNode from '$components/BucketTreeNode.svelte'
  import { bucketList, indicatorProgress, treeBucket } from '$stores'

  const handleBucketClick = async (event: CustomEvent) => {
    $indicatorProgress = true
    const bucket = event.detail.bucket
    bucket.selected = !bucket.selected
    const bucketIndex = $bucketList.findIndex((node) => node.id === bucket.id)
    $bucketList[bucketIndex] = bucket

    let treeBucketUpdated = []
    const isBucketInTree = $treeBucket.some((node) => node.path === bucket.path)

    if (isBucketInTree === false) {
      treeBucketUpdated = [
        ...$treeBucket,
        {
          id: bucket.id,
          children: [],
          isRaster: false,
          label: bucket.path.slice(0, -1),
          path: bucket.path,
        },
      ]
    } else {
      treeBucketUpdated = $treeBucket.filter((node) => node.path !== bucket.path)
    }

    treeBucketUpdated.sort((a, b) => a.label.localeCompare(b.label))
    $treeBucket = treeBucketUpdated
    $indicatorProgress = false
  }

  const handleRemoveBucket = (event: CustomEvent) => {
    $indicatorProgress = true
    const bucket = $bucketList.find((node) => node.path === event.detail.node.path)
    bucket.selected = false
    const bucketIndex = $bucketList.findIndex((node) => node.path === event.detail.node.path)
    $bucketList[bucketIndex] = bucket

    $treeBucket = $treeBucket.filter((node) => node.path !== bucket.path)
    $indicatorProgress = false
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
          <BucketTreeNode bind:node={tree} on:remove={handleRemoveBucket} />
        </ul>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  .view-container {
    padding-right: 30px;

    .cards {
      z-index: 10;
    }

    .tree {
      z-index: 1;
    }
  }
</style>
