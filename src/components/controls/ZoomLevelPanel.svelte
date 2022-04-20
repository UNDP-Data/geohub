<script lang="ts">
  import type { Layer } from '$lib/types'
  import { LayerInitialValues } from '$lib/constants'
  import MinMaxZoom from '$components/controls/vector-styles/MinMaxZoom.svelte'

  export let layer: Layer = LayerInitialValues
  export let isZoomLevelPanelVisible = false
</script>

{#if isZoomLevelPanelVisible === true}
  <div class="action">
    <MinMaxZoom {layer} />
  </div>
{/if}

<style lang="scss">
  .action {
    margin-bottom: 25px;
  }
</style>
