<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { cloneDeep } from 'lodash-es'
  import Fa from 'svelte-fa'
  import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash'
  import { faEye } from '@fortawesome/free-solid-svg-icons/faEye'

  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'

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

    if (layer.children && layer.children.length > 0) {
      layer.children.forEach((child) => {
        if (!$map.getLayer(child.definition.id)) return
        $map.setLayoutProperty(child.definition.id, 'visibility', visibility)
        child.visible = isLayerVisible
      })
    }
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      toggleVisibility()
    }
  }
</script>

<Wrapper>
  <div
    class="icon-selected"
    title="Toggle Visibility"
    aria-label="Toggle Visibility"
    tabindex="0"
    role="button"
    on:click={() => toggleVisibility()}
    on:keydown={handleKeyDown}>
    <Fa icon={visibility === 'none' ? faEye : faEyeSlash} size="sm" />
  </div>
  <Tooltip showDelay={300} hideDelay={100} yPos="above">{isLayerVisible ? 'Show Layer' : 'Hide Layer'}</Tooltip>
</Wrapper>

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';
</style>
