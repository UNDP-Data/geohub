<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Ripple from '@smui/ripple'

  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import ColorPicker from '$components/controls/ColorPicker.svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import RasterColorPicker from '../../raster/RasterColorPicker.svelte'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'fill-outline-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let RGBColor = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(110, 110, 110)'][0]
  let color
  let showToolTip = false

  $: RGBColor, setLineColor()
  $: RGBColor, console.log(RGBColor)

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
  <StyleControlGroup title="Fill Outline Color">
    {#if showToolTip}
      <div class={showToolTip ? 'tooltipshown' : 'tooltiphidden'}>
        <RasterColorPicker bind:color />
      </div>
    {/if}
    <div
      use:Ripple={{ surface: true }}
      on:click={() => (showToolTip = !showToolTip)}
      style="width: 20px; height: 20px; cursor:pointer; background: red" />
    <!--    <ColorPicker bind:RgbColor={RGBColor} />-->
  </StyleControlGroup>
{/if}
