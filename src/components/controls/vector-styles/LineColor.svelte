<script lang="ts">
  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'
  import ColorPicker from '../ColorPicker.svelte'
  import { createEventDispatcher } from 'svelte'
  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let RGBColor = [style.paint && style.paint['line-color'] ? style.paint['line-color'] : 'rgb(53, 175, 109)'][0]
  $: RGBColor, setLineColor()

  const setLineColor = () => {
    if (style.type !== LayerTypes.LINE) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint['line-color'] = RGBColor
    $map.setPaintProperty(layerId, 'line-color', RGBColor)

    dispatch('change', [
      {
        property: 'line-color',
        value: RGBColor,
      },
    ])
  }
</script>

{#if style.type === LayerTypes.LINE}
  <p>Line Color</p>
  <ColorPicker bind:RgbColor={RGBColor} />
{/if}

<style lang="scss">
</style>
