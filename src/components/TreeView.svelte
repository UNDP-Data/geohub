<script lang="ts">
  import TreeNode from './TreeNode.svelte'
  import { wtree } from '../stores'

  export let handlErrorCallback: CallableFunction
</script>

<ul>
  <TreeNode bind:node={$wtree.tree} {handlErrorCallback} />
</ul>

<style lang="scss">
  ul {
    margin: 0;
    list-style: none;
    padding-left: 1.2rem;
    user-select: none;
    padding-top: 5px;
  }
</style>
