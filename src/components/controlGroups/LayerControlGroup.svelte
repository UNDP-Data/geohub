<script lang="ts">
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import DeleteButton from '../controls/DeleteButton.svelte'
  import VisibilityButton from '../controls/VisibilityButton.svelte'
  import LayerOrderButtons from '../controls/LayerOrderButtons.svelte'
  import QueryMapInfoButton from '../controls/QueryMapInfoButton.svelte'

  export let layer: Layer = LayerInitialValues
  export let mapLayerIndex
</script>

<div class="group" style="padding-right: 5px;">
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
    padding-right: 0;
  }
</style>
