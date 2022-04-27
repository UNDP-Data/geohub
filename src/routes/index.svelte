<script context="module">
  export async function load({ fetch }) {
    const resBuckets = await fetch('azbuckets.json')
    const buckets = await resBuckets.json()

    return {
      props: {
        buckets,
      },
    }
  }
</script>

<script lang="ts">
  import { bucketList } from '$stores'
  import { BucketIntialValues } from '$lib/constants'
  import type { Bucket } from '$lib/types'

  export let buckets = [BucketIntialValues as Bucket]
  bucketList.set(buckets)
</script>
