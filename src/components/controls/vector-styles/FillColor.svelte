<script lang="ts">
  import { onMount } from 'svelte'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { DEFAULT_FILL_COLOR, LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'fill-color'

  const getFillColor = (): string => {
    let fillColor = $map.getPaintProperty(layerId, propertyName)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!fillColor || (fillColor && fillColor.type === 'interval')) {
      fillColor = DEFAULT_FILL_COLOR
    }
    return fillColor as string
  }

  let rgba = getFillColor()

  onMount(() => {
    rgba = getFillColor()
    $map.setPaintProperty(layerId, propertyName, rgba)
  })

  const handleSetColor = (e: CustomEvent) => {
    rgba = e.detail.color
    $map.setPaintProperty(layerId, propertyName, rgba)
  }
</script>

<MaplibreColorPicker
  {rgba}
  on:change={handleSetColor} />
