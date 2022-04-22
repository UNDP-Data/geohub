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
  <div class="columns filter-container">
    <div class="column filter">
      <div class="control has-icons-left has-icons-right">
        <input class="input is-rounded" type="text" placeholder="Filter Buckets" />
        <span class="icon is-small is-left">
          <i class="fas fa-search" />
        </span>
      </div>
    </div>
  </div>

  <div class="columns cards-tree-container is-gapless" style="">
    <div class="column">
      <div class="columns">
        <div class="column cards">
          {#each $bucketList as bucket}
            <BucketCard {bucket} on:click={handleBucketClick} />
          {/each}
        </div>
        <div class="column separator" style="" />
      </div>
    </div>
    <div class="column is-three-quarters tree">
      {#each $treeBucket as tree}
        <ul>
          <BucketTreeNode bind:node={tree} on:remove={handleRemoveBucket} />
        </ul>
      {/each}
    </div>
  </div>
</div>

<style lang="scss">
  $separator: 1px solid whitesmoke;
  $separator-dark: 1px solid #ccc;

  .view-container {
    .filter-container {
      border-bottom: $separator;
      margin-bottom: 20px;
      padding-left: 10px;

      @media (prefers-color-scheme: dark) {
        border-bottom: $separator-dark;
      }

      .filter {
        padding-bottom: 15px;
      }
    }

    .cards-tree-container {
      margin-bottom: 0;
      .cards {
        z-index: 10;
      }

      .tree {
        z-index: 1;
      }

      .separator {
        border-left: $separator;
        height: calc(100vh - 200px);

        @media (prefers-color-scheme: dark) {
          border-left: $separator-dark;
        }
      }
    }
  }
</style>
