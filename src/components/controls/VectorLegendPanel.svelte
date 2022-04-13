<script lang="ts">
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import VectorLegend from './VectorLegend.svelte'

  export let isLegendPanelVisible = false
  export let layer: Layer = LayerInitialValues
</script>

{#if isLegendPanelVisible === true}
  <div class="action">
    <VectorLegend {layer} />
  </div>
{/if}

<style lang="scss">
  .action {
    margin-bottom: 25px;
  }
</style>
