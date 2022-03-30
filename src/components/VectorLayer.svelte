<script lang="ts" context="module">
  const layerState = {}
</script>

<script lang="ts">
  import Accordion, { Panel } from '@smui-extra/accordion'

  import type { Layer } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import LayerNameGroup from './control-groups/LayerNameGroup.svelte'
  import LayerControlGroup from './control-groups/LayerControlGroup.svelte'
  import OpacityButton from './controls/OpacityButton.svelte'
  import OpacityPanel from './controls/OpacityPanel.svelte'
  import VectorLegendButton from './controls/VectorLegendButton.svelte'
  import VectorLegendPanel from './controls/VectorLegendPanel.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id

  let panelOpen: boolean = layerState[layerId] || false
  let mapLayerIndex: number
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
</script>

<div class="accordion-container">
  <Accordion>
    <Panel variant="raised" bind:open={panelOpen} style="padding: 15px;">
      <div class="layer-header">
        <div>
          <LayerNameGroup {mapLayerIndex} {layer} />
          <div class="layer-header-icons">
            <!-- GROUP : EDIT OPTIONS-->
            <div class="group">
              <VectorLegendButton bind:isLegendPanelVisible />
              <OpacityButton bind:isOpacityPanelVisible />
            </div>

            <LayerControlGroup bind:mapLayerIndex {layer} />
          </div>
        </div>
        <div class="layer-actions">
          <VectorLegendPanel {layer} {isLegendPanelVisible} />
          <OpacityPanel {layer} {isOpacityPanelVisible} />
        </div>
      </div>
    </Panel>
  </Accordion>
</div>

<style lang="scss">
  .accordion-container {
    margin-left: 15px;
    margin-bottom: 15px;

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

        .group {
          background: #f0f0f0;
          border-radius: 7.5px;
          padding: 5px;
          padding-right: 0;

          @media (prefers-color-scheme: dark) {
            background: #0d1117;
            border-color: #30363d;
            color: white;
          }
        }
      }

      .layer-actions {
        margin-top: 10px;
        border-top: 1px solid rgba(204, 204, 204, 0.5);
      }
    }
  }
</style>
