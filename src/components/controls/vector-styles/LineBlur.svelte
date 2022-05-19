<script lang="ts">
  import Slider from '$components/controls/vector-styles/Slider.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues

  let defaultValue = 0
  let layerType = LayerTypes.LINE
  let maxValue = 10
  let minValue = 0
  let propertyName = 'line-blur'
  let propertyType = 'paint'
  let stepValue = 0.1
  let titleName = 'Line Blur'
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
