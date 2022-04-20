<script lang="ts">
  import TreeNode from '$components/TreeNode.svelte'
  import { wtree } from '$stores'
</script>

<ul>
  <TreeNode bind:node={$wtree.tree} />
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
