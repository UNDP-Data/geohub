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
  import chroma from 'chroma-js'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'fill-outline-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let RGBColor = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(110, 110, 110)'][0]
  let color
  let showToolTip = false
  let rgbString
  let rgbArray

  $: color, setLineColor()

  if (style.paint && style.paint[propertyName]) {
    rgbString = style.paint[propertyName].replace('rgb(', '').replace(')', '')
    rgbArray = Array(rgbString)
    let r = parseInt(rgbArray[0])
    let g = parseInt(rgbArray[1])
    let b = parseInt(rgbArray[2])
    color = {
      r: r,
      g: g,
      b: b,
      hex: chroma([r, g, b]).hex('rgba'),
      h: chroma([r, g, b]).hsv()[0],
      s: chroma([r, g, b]).hsv()[1],
      v: chroma([r, g, b]).hsv()[2],
    }
  } else {
    let r = 110
    let g = 110
    let b = 110
    color = {
      r: r,
      g: g,
      b: b,
      hex: chroma([r, g, b]).hex('rgba'),
      h: chroma([r, g, b]).hsv()[0],
      s: chroma([r, g, b]).hsv()[1],
      v: chroma([r, g, b]).hsv()[2],
    }
  }

  const setLineColor = () => {
    if (style.type !== LayerTypes.FILL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = `rgb(${color.r}, ${color.g}, ${color.b})`
    $map.setPaintProperty(layerId, propertyName, `rgb(${color.r}, ${color.g}, ${color.b})`)
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
      style="width: 32px; height: 32px; cursor:pointer; background: {`rgb(${color.r}, ${color.g}, ${color.b})`}" />
    <!--    <ColorPicker bind:RgbColor={RGBColor} />-->
  </StyleControlGroup>
{/if}
