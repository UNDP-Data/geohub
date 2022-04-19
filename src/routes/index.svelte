<script context="module">
  export async function load({ fetch }) {
    const resTree = await fetch('azstorage.json')
    const tree = await resTree.json()

    const resBuckets = await fetch('azbuckets.json')
    const buckets = await resBuckets.json()

    return {
      props: {
        tree,
        buckets,
      },
    }
  }
</script>

<script lang="ts">
  import { bucketList, wtree } from '../stores'
  import { BucketIntialValues, TreeNodeInitialValues } from '../lib/constants'
  import type { Bucket } from '../lib/types'

  export let tree = { tree: TreeNodeInitialValues }
  wtree.set(tree)

  export let buckets = [BucketIntialValues as Bucket]
  bucketList.set(buckets)
</script>
