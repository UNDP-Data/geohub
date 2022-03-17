<script context="module">
  export async function load({ fetch }) {
    const res = await fetch('azstorage.json')
    const tree = await res.json()
    return {
      props: {
        tree,
      },
    }
  }
</script>

<script lang="ts">
  import { wtree } from '../stores'
  import { TreeNodeInitialValues } from '../lib/constants'

  export let tree = {
    tree: TreeNodeInitialValues,
  }
  // console.log('client in index', tree)
  wtree.set(tree)
</script>
