<script lang="ts" context="module">
  const layerState = {}
</script>

<script lang="ts">
  import Accordion, { Panel } from '@smui-extra/accordion'

  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import LayerName from './LayerName.svelte'

  export let layerConfig: Layer = LayerInitialValues

  let definition: LayerDefinition
  ;({ definition } = layerConfig)
  const layerId = definition.id

  let panelOpen: boolean = layerState[layerId] || false
</script>

<div class="accordion-container" style="margin-left: 15px; margin-bottom: 15px;">
  <Accordion>
    <Panel variant="raised" bind:open={panelOpen} style="padding: 15px;">
      <div class="layer-header">
        <div>
          <LayerName bind:layerConfig />
        </div>
      </div>
    </Panel>
  </Accordion>
</div>

<style lang="scss">
</style>
