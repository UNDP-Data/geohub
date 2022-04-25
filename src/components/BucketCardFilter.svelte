<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { cloneDeep } from 'lodash-es'

  import BucketCard from '$components/BucketCard.svelte'
  import { BucketType } from '$lib/constants'
  import type { Bucket } from '$lib/types'

  const dispatch = createEventDispatcher()

  let filterBucket: Bucket = {
    id: 'filter',
    label: 'Filter Buckets',
    description: 'Find buckets based on the label, description or tags',
    tags: [],
    published: true,
    path: '',
    type: BucketType.INTERNAL,
    icon: 'fa-solid fa-magnifying-glass',
    selected: false,
  }

  const handleFilterBucketClick = () => {
    const filterBucketSelected = cloneDeep(filterBucket)
    filterBucketSelected.selected = !filterBucket.selected
    filterBucket = filterBucketSelected

    dispatch('click', { bucketCardFilterSelected: filterBucket.selected })
  }
</script>

<BucketCard bucket={filterBucket} on:click={handleFilterBucketClick} />
