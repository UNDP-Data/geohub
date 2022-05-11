<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import ColorPicker from '$components/controls/ColorPicker.svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'text-halo-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let TextHaloColor = style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(255, 255, 255)'

  $: TextHaloColor, setTextHaloColor()

  const setTextHaloColor = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = TextHaloColor
    $map.setPaintProperty(layerId, propertyName, TextHaloColor)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Text Halo Color">
    <ColorPicker bind:RgbColor={TextHaloColor} />
  </StyleControlGroup>
{/if}

<style lang="scss">
  @use '@material/image-list/index' as image-list;
</style>
