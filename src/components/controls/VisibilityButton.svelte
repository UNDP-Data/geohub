<script lang="ts">
  import Fa from 'svelte-fa'
  import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash'
  import { faEye } from '@fortawesome/free-solid-svg-icons/faEye'

  import { map } from '../../stores'
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id

  let isLayerVisible = false

  $: visibility = isLayerVisible ? 'visible' : 'none'

  const toggleVisibility = () => {
    isLayerVisible = !isLayerVisible
    if (!$map.getLayer(layerId)) {
      $map.addLayer(layer.definition)
    }
    $map.setLayoutProperty(layerId, 'visibility', visibility)
  }
</script>

<div class="icon-selected" title="Show/hide layer" on:click={() => toggleVisibility()}>
  <Fa icon={visibility === 'none' ? faEyeSlash : faEye} size="1x" />
</div>

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';
</style>
