<script lang="ts">
  import { slide } from 'svelte/transition'

  import BucketCard from '$components/BucketCard.svelte'
  import BucketFilter from '$components/BucketFilter.svelte'
  import BucketTreeNode from '$components/BucketTreeNode.svelte'
  import { bucketList, indicatorProgress, treeBucket } from '$stores'

  let bucketsMeetThereshold = []

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
      <BucketFilter bind:bucketsMeetThereshold />
    </div>
  </div>

  <div class="columns cards-tree-container is-gapless">
    <div class="column">
      <div class="columns">
        <div class="column cards" data-testid="buckets-container">
          {#if bucketsMeetThereshold.length > 0}
            {#if bucketsMeetThereshold.includes('NO_RESULTS')}
              <div class="no-results">No results</div>
            {:else}
              {#each $bucketList as bucket}
                {#if bucketsMeetThereshold.includes(bucket.path)}
                  <div data-testid={bucket.path} transition:slide>
                    <BucketCard {bucket} on:click={handleBucketClick} />
                  </div>
                {/if}
              {/each}
            {/if}
          {:else}
            {#each $bucketList as bucket}
              <div data-testid={bucket.path} transition:slide>
                <BucketCard {bucket} on:click={handleBucketClick} />
              </div>
            {/each}
          {/if}
        </div>
        <div class="column separator" style="" />
      </div>
    </div>
    <div class="column is-three-quarters tree" data-testid="tree-container">
      {#if $treeBucket.length === 0}
        <div class="title is-size-4">Welcome to GeoHub</div>
        <div class="subtitle is-size-5">
          This UNDP data repository features a range of innovative tools to visualise, analyse, and download data.
        </div>
        <div class="subtitle is-size-5">
          Select an icon to the left, to explore the data. Click on each icon to see data available for visualisation
          and download.
        </div>
      {:else}
        {#each $treeBucket as tree}
          <ul>
            <BucketTreeNode bind:node={tree} on:remove={handleRemoveBucket} />
          </ul>
        {/each}
      {/if}
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

        .title {
          margin-bottom: 30px;
        }
      }

      .separator {
        border-left: $separator;
        height: calc(100vh - 200px);

        @media (prefers-color-scheme: dark) {
          border-left: $separator-dark;
        }
      }

      .no-results {
        padding-left: 11px;
        white-space: nowrap;
      }
    }
  }
</style>
