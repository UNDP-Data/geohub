<script lang="ts">
  import { onMount } from 'svelte'

  import MaplibreColorPicker from '$components/controls/vector-styles/MaplibreColorPicker.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.id
  const propertyName = 'icon-color'
  export let defaultColor: string

  const getIconColor = (): string => {
    let iconColor = $map.getPaintProperty(layer.id, 'icon-color')
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!iconColor || (iconColor && iconColor.type === 'interval')) {
      iconColor = defaultColor
    }
    return iconColor as string
  }

  let rgba = getIconColor()

  onMount(() => {
    rgba = getIconColor()
    $map.setPaintProperty(layerId, propertyName, rgba)
  })

  const handleSetColor = (e: CustomEvent) => {
    if (e?.detail?.color) {
      $map.setPaintProperty(layerId, propertyName, e.detail.color)
      $map.fire('icon-color:changed', { color: e.detail.color })
    }
  }
</script>

<MaplibreColorPicker
  {rgba}
  on:change={handleSetColor} />
