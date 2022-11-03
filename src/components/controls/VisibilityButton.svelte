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

  $: visibility = getVisibility()

  const getVisibility = (): 'visible' | 'none' => {
    const layerStyle = $map.getStyle().layers.find((l) => l.id === layer.definition.id)
    let visibility: 'visible' | 'none' = 'visible'
    if (layerStyle.layout && layerStyle.layout.visibility) {
      visibility = layerStyle.layout.visibility
    }
    return visibility
  }

  const toggleVisibility = () => {
    if (!$map.getLayer(layerId)) {
      $map.addLayer(layer.definition)
    }
    visibility = visibility === 'visible' ? 'none' : 'visible'
    $map.setLayoutProperty(layerId, 'visibility', visibility)

    const layerClone = cloneDeep(layer)
    const layerIndex = $layerList.findIndex((layer) => layer.definition.id === layerId)
    $layerList[layerIndex] = layerClone

    if (layer.children && layer.children.length > 0) {
      layer.children.forEach((child) => {
        if (!$map.getLayer(child.definition.id)) return
        $map.setLayoutProperty(child.definition.id, 'visibility', visibility)
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
    <Fa
      icon={visibility === 'visible' ? faEye : faEyeSlash}
      size="sm" />
  </div>
  <Tooltip
    showDelay={300}
    hideDelay={100}
    yPos="above">{visibility === 'visible' ? 'Show Layer' : 'Hide Layer'}</Tooltip>
</Wrapper>

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';
</style>
