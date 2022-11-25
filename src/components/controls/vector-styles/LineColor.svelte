<script lang="ts">
  import { onMount } from 'svelte'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.id
  const propertyName = 'line-color'
  export let defaultColor: string = undefined

  const getLineColor = (): string => {
    let lineColor = $map.getPaintProperty(layerId, 'line-color')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!lineColor || (lineColor && lineColor.type === 'interval')) {
      lineColor = defaultColor
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
