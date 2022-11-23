<script lang="ts">
  import ActionsDropdown from '$components/controls/ActionsDropdown.svelte'
  import DeleteButton from '$components/controls/DeleteButton.svelte'
  import VisibilityButton from '$components/controls/VisibilityButton.svelte'
  import BucketTreeItemCardButton from '$components/BucketTreeItemCardButton.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues
</script>

<div class="group">
  {#if layer.tree}
    <BucketTreeItemCardButton
      bind:tree={layer.tree}
      isShownInTree={false} />
  {/if}
  <VisibilityButton {layer} />
  <DeleteButton {layer} />
  {#if layer.tree}
    <ActionsDropdown {layer} />
  {/if}
</div>

<style lang="scss">
  .group {
    align-items: center;
    border-radius: 7.5px;
    display: flex;
    justify-content: left;
    padding: 5px;

    @media (prefers-color-scheme: dark) {
      border-color: #30363d;
      color: white;
    }
  }
</style>
