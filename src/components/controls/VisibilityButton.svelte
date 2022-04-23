<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { cloneDeep } from 'lodash-es'
  import Fa from 'svelte-fa'
  import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash'
  import { faEye } from '@fortawesome/free-solid-svg-icons/faEye'

  import { layerList, map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues } from '$lib/constants'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id

  let isLayerVisible = false

  $: visibility = isLayerVisible ? 'visible' : 'none'

  const toggleVisibility = () => {
    if (!$map.getLayer(layerId)) {
      $map.addLayer(layer.definition)
    }
    $map.setLayoutProperty(layerId, 'visibility', visibility)

    const layerClone = cloneDeep(layer)
    layerClone.visible = isLayerVisible
    const layerIndex = $layerList.findIndex((layer) => layer.definition.id === layerId)
    $layerList[layerIndex] = layerClone
    isLayerVisible = !isLayerVisible
  }
</script>

<Wrapper>
  <div class="icon-selected" on:click={() => toggleVisibility()}>
    <Fa icon={visibility === 'none' ? faEyeSlash : faEye} size="1x" />
  </div>
  <Tooltip showDelay={300} hideDelay={100} yPos="above">{isLayerVisible ? 'Show Layer' : 'Hide Layer'}</Tooltip>
</Wrapper>

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';
</style>
