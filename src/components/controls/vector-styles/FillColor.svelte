<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'
  import ColorPicker from '../ColorPicker.svelte'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'fill-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let RGBColor = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(20, 180, 60)'][0]
  $: RGBColor, setLineColor()

  const setLineColor = () => {
    if (style.type !== LayerTypes.FILL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = RGBColor
    $map.setPaintProperty(layerId, propertyName, RGBColor)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.FILL}
  <div class="style-editing-box">
    <span class="box-title">Fill Color</span>
    <p>
      <ColorPicker bind:RgbColor={RGBColor} />
    </p>
  </div>
{/if}

<style lang="scss">
  @import '../../../styles/style-editing-box.scss';
</style>
