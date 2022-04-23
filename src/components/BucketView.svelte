<script lang="ts">
  import { slide } from 'svelte/transition'
  import { debounce } from 'lodash-es'

  import BucketCard from '$components/BucketCard.svelte'
  import BucketTreeNode from '$components/BucketTreeNode.svelte'
  import { STRING_COMPARE_THRESHOLD } from '$lib/constants'
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

  let bucketsMeetThereshold = new Map()

  const handleRemoveBucket = (event: CustomEvent) => {
    $indicatorProgress = true
    const bucket = $bucketList.find((node) => node.path === event.detail.node.path)
    bucket.selected = false
    const bucketIndex = $bucketList.findIndex((node) => node.path === event.detail.node.path)
    $bucketList[bucketIndex] = bucket

    $treeBucket = $treeBucket.filter((node) => node.path !== bucket.path)
    $indicatorProgress = false
  }

  const handleFilterInput = debounce((e) => {
    bucketsMeetThereshold.clear()
    const bucketsMeetTheresholdFilterInput = new Map()
    const inputString = (e.target as HTMLInputElement).value

    $bucketList.forEach((bucket) => {
      let targetStrings = [bucket.tags, bucket.label, bucket.description].flat()

      targetStrings.forEach((targetString) => {
        const score = stringSimilarity(inputString, targetString, false)

        if (score >= STRING_COMPARE_THRESHOLD) {
          bucketsMeetTheresholdFilterInput.set(bucket.path, bucket)
        }
      })
    })

    bucketsMeetThereshold = bucketsMeetTheresholdFilterInput
  }, 500)

  /**
   * Takes in two strings and returns how similiar they are via percentage. Uses Dice's Coefficient.
   * @param stringOne First string to be compared
   * @param stringTwo Second string to be compared
   * @param caseSensitive By default the comparison is case sensitive
   * @returns Percentage of how similiar the strings are
   */
  const stringSimilarity = (stringOne: string, stringTwo: string, caseSensitive = true) => {
    stringOne = stringOne.replace(/\s/g, '')
    stringTwo = stringTwo.replace(/\s/g, '')

    if (!caseSensitive) {
      stringOne = stringOne.toLowerCase()
      stringTwo = stringTwo.toLowerCase()
    }

    if (!stringOne.length && !stringTwo.length) return 1
    if (!stringOne.length || !stringTwo.length) return 0
    if (stringOne === stringTwo) return 1
    if (stringOne.length === 1 && stringTwo.length === 1) return 0
    if (stringOne.length < 2 || stringTwo.length < 2) return 0

    const firstBigrams = new Map()
    for (let i = 0; i < stringOne.length - 1; i++) {
      const bigram = stringOne.substring(i, i + 2)
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) + 1 : 1

      firstBigrams.set(bigram, count)
    }

    let intersectionSize = 0
    for (let i = 0; i < stringTwo.length - 1; i++) {
      const bigram = stringTwo.substring(i, i + 2)
      const count = firstBigrams.has(bigram) ? firstBigrams.get(bigram) : 0

      if (count > 0) {
        firstBigrams.set(bigram, count - 1)
        intersectionSize++
      }
    }

    return (2.0 * intersectionSize) / (stringOne.length + stringTwo.length - 2)
  }
</script>

<div class="view-container" data-testid="view-container">
  <div class="columns filter-container">
    <div class="column filter">
      <div class="control has-icons-left has-icons-right">
        <input class="input is-rounded" type="text" placeholder="Filter Buckets" on:input={handleFilterInput} />
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
          {#if bucketsMeetThereshold.size > 0}
            {#each [...bucketsMeetThereshold] as [key, bucket]}
              <div data-testid={key} transition:slide>
                <BucketCard {bucket} on:click={handleBucketClick} />
              </div>
            {/each}
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
