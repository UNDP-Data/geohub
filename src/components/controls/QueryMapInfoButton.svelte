<script lang="ts">
  import Fa from 'svelte-fa'
  import { faToggleOn } from '@fortawesome/free-solid-svg-icons/faToggleOn'
  import { faToggleOff } from '@fortawesome/free-solid-svg-icons/faToggleOff'
  import { cloneDeep } from 'lodash'

  import { layerList } from '../../stores'
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id

  let queryInfoEnabled = true

  const setQueryInfoEnabled = () => {
    const layerClone = cloneDeep(layer)
    layerClone.queryInfoEnabled = !queryInfoEnabled
    const layerIndex = $layerList.findIndex((layer) => layer.definition.id === layerId)
    $layerList[layerIndex] = layerClone
    queryInfoEnabled = !queryInfoEnabled
  }
</script>

<div title="Query Map Info" class="icon-selected" on:click={() => setQueryInfoEnabled()}>
  <Fa icon={queryInfoEnabled ? faToggleOn : faToggleOff} size="1x" />
</div>

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';
</style>
