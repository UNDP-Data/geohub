<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { createEventDispatcher } from 'svelte'

  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import ColorPicker from '../ColorPicker.svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'line-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let RGBColor = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(53, 175, 109)'][0]
  $: RGBColor, setLineColor()

  const setLineColor = () => {
    if (style.type !== LayerTypes.LINE) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = RGBColor
    $map.setPaintProperty(layerId, propertyName, RGBColor)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.LINE}
  <StyleControlGroup title="Line Color">
    <ColorPicker bind:RgbColor={RGBColor} />
  </StyleControlGroup>
{/if}
