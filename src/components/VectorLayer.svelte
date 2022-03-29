<script lang="ts" context="module">
  const layerState = {}
</script>

<script lang="ts">
  import Accordion, { Panel } from '@smui-extra/accordion'

  import { map } from '../stores'
  import type { Layer } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import LayerName from './LayerName.svelte'
  import LayerControlPanel from './LayerControlPanel.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id

  let panelOpen: boolean = layerState[layerId] || false
  const mapLayers = $map.getStyle().layers
  let mapLayerIndex
  let mapLayerLength = mapLayers.length
</script>

<div class="accordion-container" style="margin-left: 15px; margin-bottom: 15px;">
  <Accordion>
    <Panel variant="raised" bind:open={panelOpen} style="padding: 15px;">
      <div class="layer-header">
        <LayerName {mapLayerIndex} {mapLayerLength} {layer} />
        <div class="layer-header-icons">
          <LayerControlPanel bind:mapLayerIndex {layer} />
        </div>
      </div>
    </Panel>
  </Accordion>
</div>

<style lang="scss">
  .layer-header {
    .layer-header-icons {
      padding-top: 10px;
      display: flex;
      justify-content: left;
      align-items: center;
      gap: 15px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(204, 204, 204, 0.5);
    }
  }
</style>
