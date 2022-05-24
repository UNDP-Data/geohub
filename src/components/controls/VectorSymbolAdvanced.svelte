<script lang="ts">
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
</script>

<div class="symbol-advanced-container">
  <div class="columns first-row">
    <div class="column">
      <div class="subtitle is-size-6">Advanced Icon View</div>
    </div>
  </div>
</div>

<style lang="scss">
</style>
