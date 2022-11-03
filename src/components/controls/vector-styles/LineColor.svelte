<script lang="ts">
  import { onMount } from 'svelte'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { DEFAULT_LINE_COLOR, LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'line-color'

  const getLineColor = (): string => {
    let lineColor = $map.getPaintProperty(layer.definition.id, propertyName)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!lineColor || (lineColor && lineColor.type === 'interval')) {
      lineColor = DEFAULT_LINE_COLOR
    }
    return lineColor as string
  }
  let rgba = getLineColor()

  onMount(() => {
    rgba = getLineColor()
    $map.setPaintProperty(layerId, propertyName, rgba)
  })

  const handleSetColor = (e: CustomEvent) => {
    if (e?.detail?.color) {
      $map.setPaintProperty(layerId, propertyName, e.detail.color)
      $map.fire('line-color:changed', { value: e.detail.color })
    }
  }
</script>

<MaplibreColorPicker
  {rgba}
  on:change={handleSetColor} />
