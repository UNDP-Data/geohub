<script lang="ts">
  import { slide } from 'svelte/transition'
  import LinearProgress from '@smui/linear-progress'

  import BucketCard from '$components/BucketCard.svelte'
  import BucketCardFilter from '$components/BucketCardFilter.svelte'
  import BucketFilter from '$components/BucketFilter.svelte'
  import BucketTreeView from '$components/BucketTreeView.svelte'
  import { bucketList, indicatorProgress, treeBucket } from '$stores'

  let bucketsMeetThereshold = []
  let bucketCardFilterSelected = false

  const handleBucketClick = async (event: CustomEvent) => {
    $indicatorProgress = true
    const bucket = event.detail.bucket
    //console.log(JSON.stringify(bucket))
    bucket.selected = !bucket.selected
    const bucketIndex = $bucketList.findIndex((node) => node.id === bucket.id)
    $bucketList[bucketIndex] = bucket

    let treeBucketUpdated = []
    const isBucketInTree = $treeBucket.some((node) => node.path === bucket.path)

    if (isBucketInTree === false) {
      let isBucketStac = bucket.tags.find((tag: string) => tag.toLowerCase() === 'stac') ? true : false
      const isBucketMartin = bucket.tags.find((tag: string) => tag.toLowerCase() === 'martin') ? true : false
      const isBucketPgtileserv = bucket.tags.find((tag: string) => tag.toLowerCase() === 'pgtileserv') ? true : false
      const isBucketMosaic = bucket.tags.find((tag: string) => tag.toLowerCase() === 'mosaicjson') ? true : false
      if (isBucketMosaic === true) {
        isBucketStac = true
      }
      let dynamicSourceType = isBucketMartin ? 'martin' : isBucketPgtileserv ? 'pgtileserv' : undefined
      treeBucketUpdated = [
        ...$treeBucket,
        {
          id: bucket.id,
          isRaster: true,
          isStac: isBucketStac,
          dynamicSourceType: dynamicSourceType,
          isMosaicJSON: isBucketMosaic,
          label: isBucketStac || dynamicSourceType ? bucket.label : bucket.path.slice(0, -1),
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

  const handleBucketCardFilterClick = (event?: CustomEvent) => {
    bucketCardFilterSelected = event.detail.bucketCardFilterSelected
  }
</script>

<div
  class="view-container"
  data-testid="view-container">
  <div
    class="columns cards-tree-container is-gapless"
    style="display: flex!important;">
    <div
      class="column"
      style="max-width: 112px;">
      <div class="columns m-0 p-0">
        <div
          class="column cards"
          data-testid="buckets-container">
          <BucketCardFilter on:click={handleBucketCardFilterClick} />

          {#if bucketsMeetThereshold.length > 0}
            {#if !bucketsMeetThereshold.includes('NO_RESULTS')}
              {#each $bucketList as bucket}
                {#if bucketsMeetThereshold.includes(bucket.path)}
                  <div
                    data-testid={bucket.path}
                    transition:slide>
                    <BucketCard
                      {bucket}
                      on:click={handleBucketClick} />
                  </div>
                {/if}
              {/each}
            {/if}
          {:else}
            {#each $bucketList as bucket}
              <div
                data-testid={bucket.path}
                transition:slide>
                <BucketCard
                  {bucket}
                  on:click={handleBucketClick} />
              </div>
            {/each}
          {/if}
        </div>
        <div class="column separator" />
      </div>
    </div>
    <div class="column">
      <div
        id="tree-container"
        class="tree"
        data-testid="tree-container">
        {#if bucketCardFilterSelected}
          <div
            class="filter-container"
            data-testid="filter-container">
            <BucketFilter bind:bucketsMeetThereshold />
          </div>
        {/if}

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
          <nav>
            {#each $treeBucket as tree}
              <ul
                id={tree.label
                  .split(' ')
                  .map((el) => el.toLowerCase())
                  .join('-')}
                label={tree.label}>
                <BucketTreeView
                  bind:node={tree}
                  on:remove={handleRemoveBucket} />
              </ul>
            {/each}
          </nav>
        {/if}
      </div>
    </div>
  </div>
</div>

<style lang="scss">
  $separator: 1px solid whitesmoke;
  $separator-dark: 1px solid #ccc;

  .view-container {
    .cards-tree-container {
      margin-bottom: 0;

      .cards {
        z-index: 5;
        max-width: fit-content;
        width: fit-content;
        overflow-y: auto;
        height: calc(100vh - 150px);

        @media (max-width: 89.9375em) {
          height: calc(100vh - 120px);
        }
      }

      .tree {
        z-index: 1;
        overflow-y: auto;
        height: calc(100vh - 150px);

        @media (max-width: 89.9375em) {
          height: calc(100vh - 120px);
        }

        .filter-container {
          position: absolute;

          top: 25px;
          left: 70px;

          @media (prefers-color-scheme: dark) {
            border-bottom: $separator-dark;
          }
        }

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
        height: calc(100vh - 150px);
        @media (max-width: 89.9375em) {
          height: calc(100vh - 120px);
        }

        max-width: 21px;
        width: 21px;

        @media (prefers-color-scheme: dark) {
          border-left: $separator-dark;
        }
      }
    }
  }
</style>
