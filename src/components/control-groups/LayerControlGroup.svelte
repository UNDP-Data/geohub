<script lang="ts">
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import DeleteButton from '../controls/DeleteButton.svelte'
  import VisibilityButton from '../controls/VisibilityButton.svelte'
  import LayerOrderButtons from '../controls/LayerOrderButtons.svelte'
  import QueryMapInfoButton from '../controls/QueryMapInfoButton.svelte'

  export let layer: Layer = LayerInitialValues
  export let mapLayerIndex: number
</script>

<div class="group">
  <QueryMapInfoButton {layer} />
  <LayerOrderButtons {layer} bind:mapLayerIndex />
  <VisibilityButton {layer} />
  <DeleteButton {layer} />
</div>

<style lang="scss">
  .group {
    background: #f0f0f0;
    border-radius: 7.5px;
    padding: 5px;

    @media (prefers-color-scheme: dark) {
      background: #0d1117;
      border-color: #30363d;
      color: white;
    }
  }
</style>
