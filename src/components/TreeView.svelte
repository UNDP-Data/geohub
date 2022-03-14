<script lang="ts">
  import TreeNode from './TreeNode.svelte'
  import { wtree } from '../stores/stores'
</script>

<ul style="padding-top: 5px;">
  <TreeNode bind:node={$wtree.tree} />
</ul>

<style lang="scss">
  ul {
    margin: 0;
    list-style: none;
    padding-left: 1.2rem;
    user-select: none;
  }
</style>
