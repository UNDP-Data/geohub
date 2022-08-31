<script lang="ts">
  import { slide } from 'svelte/transition'

  import BucketCard from '$components/BucketCard.svelte'
  import BucketCardFilter from '$components/BucketCardFilter.svelte'
  import BucketFilter from '$components/BucketFilter.svelte'
  import BucketTreeNode from '$components/BucketTreeNode.svelte'
  import { bucketList, indicatorProgress, modalVisible, treeBucket } from '$stores'

  let bucketsMeetThereshold = []
  let bucketCardFilterSelected = false

  const handleBucketClick = async (event: CustomEvent) => {
    $indicatorProgress = true
    const bucket = event.detail.bucket
    console.log(bucket.label)
    bucket.selected = !bucket.selected
    const bucketIndex = $bucketList.findIndex((node) => node.id === bucket.id)
    $bucketList[bucketIndex] = bucket

    let treeBucketUpdated = []
    const isBucketInTree = $treeBucket.some((node) => node.path === bucket.path)

    if (isBucketInTree === false) {
      const isBucketStac = bucket.tags.find((tag: string) => tag.toLowerCase() === 'stac') ? true : false
      const isBucketMartin = bucket.tags.find((tag: string) => tag.toLowerCase() === 'martin') ? true : false

      treeBucketUpdated = [
        ...$treeBucket,
        {
          id: bucket.id,
          isRaster: true,
          isStac: isBucketStac,
          isMartin: isBucketMartin,
          label: isBucketStac || isBucketMartin ? bucket.label : bucket.path.slice(0, -1),
          path: bucket.path,
          children: [],
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

  const handleBucketCardFilterClick = (event: CustomEvent) => {
    bucketCardFilterSelected = event.detail.bucketCardFilterSelected
  }

  const onKeyDown = (e) => {
    console.log(e)
  }
</script>

<div class="view-container" data-testid="view-container">
  {#if bucketCardFilterSelected}
    <div class="columns filter-container" transition:slide data-testid="filter-container">
      <div class="column filter">
        <BucketFilter bind:bucketsMeetThereshold />
      </div>
    </div>
  {/if}

  <div class="columns cards-tree-container is-gapless">
    <div class="column" style="max-width: 112px;">
      <div class="columns">
        <div class="column cards" data-testid="buckets-container" style={$modalVisible ? 'z-index: 1;' : ''}>
          <div class="card-filter" data-testid="buckets-filter-container">
            <BucketCardFilter on:click={handleBucketCardFilterClick} />
          </div>

          {#if bucketsMeetThereshold.length > 0}
            {#if !bucketsMeetThereshold.includes('NO_RESULTS')}
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
    <div class="column is-three-quarters tree" data-testid="tree-container" style="overflow-y: auto">
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
        max-width: fit-content;
        width: fit-content;
      }

      .tree {
        z-index: 1;

        .title {
          margin-bottom: 30px;
        }

        .title,
        .subtitle {
          @media (prefers-color-scheme: dark) {
            color: #fff;
          }
        }
      }

      .separator {
        border-left: $separator;
        height: calc(100vh - 200px);
        max-width: 21px;
        width: 21px;

        @media (prefers-color-scheme: dark) {
          border-left: $separator-dark;
        }
      }
    }
  }
</style>
