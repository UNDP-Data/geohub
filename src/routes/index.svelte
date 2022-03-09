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
  import { wtree } from '../stores/stores'
  export let tree = {
    tree: {
      label: 'GeoHub Azure Storage',
      children: [],
      path: '/',
      url: null,
      isRaster: false,
    },
  }
  console.log('client in index', tree)
  wtree.set(tree)
</script>

<style global>
  .mdc-drawer {
    width: 300px;
  }

  .mdc-drawer.mdc-drawer--open:not(.mdc-drawer--closing) + .mdc-drawer-app-content {
    margin-left: 300px;
    margin-right: 0;
  }
</style>
