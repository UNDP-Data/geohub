<script lang="ts">
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import DeleteButton from '../controls/DeleteButton.svelte'
  import VisibilityButton from '../controls/VisibilityButton.svelte'
  import LayerOrderButtons from '../controls/LayerOrderButtons.svelte'

  export let layer: Layer = LayerInitialValues
  export let mapLayerIndex: number
</script>

<div class="group">
  <LayerOrderButtons {layer} bind:mapLayerIndex />
  <VisibilityButton {layer} />
  <DeleteButton {layer} />
</div>

<style lang="scss">
  .group {
    background: #e3e3e3;
    border-radius: 7.5px;
    padding: 5px;

    @media (prefers-color-scheme: dark) {
      background: #323234;
      border-color: #30363d;
      color: white;
    }
  }
</style>
