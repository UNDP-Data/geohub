<script lang="ts">
  import { onMount } from 'svelte'
  import Slider from '$components/controls/vector-styles/Slider.svelte'
  import { DEFAULT_LINE_WIDTH, LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import { getLineWidth } from '$lib/helper'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.id

  let defaultValue = getLineWidth($map, layer.id, DEFAULT_LINE_WIDTH)
  let layerType = LayerTypes.LINE
  let maxValue = 10
  let minValue = 0
  let propertyName = 'line-width'
  let propertyType: 'paint' | 'layout' = 'paint'
  let stepValue = 0.1
  let titleName = 'Line Width'

  onMount(() => {
    defaultValue = getLineWidth($map, layer.id, DEFAULT_LINE_WIDTH)
    setValue(defaultValue)
  })

  const handleChange = (event: CustomEvent) => {
    if (event?.detail?.value) {
      setValue(event.detail.value as number)
    }
  }

  const setValue = (value: number) => {
    if (!value) {
      value = DEFAULT_LINE_WIDTH
    }
    $map.setPaintProperty(layerId, propertyName, value)
  }
</script>

<Slider
  bind:layer
  styleControlGroupDisabled={true}
  on:change={handleChange}
  bind:layerType
  bind:propertyName
  bind:titleName
  bind:defaultValue
  bind:minValue
  bind:maxValue
  bind:stepValue
  bind:propertyType />
