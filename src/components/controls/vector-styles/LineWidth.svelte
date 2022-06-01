<script lang="ts">
  import Slider from '$components/controls/vector-styles/Slider.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  let defaultValue = 1

  let layerType = LayerTypes.LINE
  let maxValue = 10
  let minValue = 0
  let propertyName = 'line-width'
  let propertyType = 'paint'
  let stepValue = 0.1
  let titleName = 'Line Width'
</script>

<Slider
  {layer}
  styleControlGroupDisabled={true}
  bind:layerType
  bind:propertyName
  bind:titleName
  bind:defaultValue
  bind:minValue
  bind:maxValue
  bind:stepValue
  bind:propertyType />
