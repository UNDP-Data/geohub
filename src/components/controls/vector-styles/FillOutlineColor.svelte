<script lang="ts" context="module">
  let fillOutlineState = {}
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Ripple from '@smui/ripple'

  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import DefaultColorPicker from '../../DefaultColorPicker.svelte'
  import chroma from 'chroma-js'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'fill-outline-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  // Default Value for color object
  const r = 110
  const g = 110
  const b = 110
  const a = 1
  let color
  if (!Object.keys(fillOutlineState).length) {
    color = {
      r,
      g,
      b,
      a,
      hex: chroma([r, g, b]).hex('rgb'),
      h: chroma([r, g, b]).hsv()[0],
      s: chroma([r, g, b]).hsv()[1],
      v: chroma([r, g, b]).hsv()[2],
    }
  } else {
    color = fillOutlineState[layerId]
  }

  let showToolTip = false
  let rgbaString = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : `rgba(${r}, ${g}, ${b})`][0]

  const setLineColor = () => {
    rgbaString = `rgba(${color.r},${color.g},${color.b},${color.a})`
    fillOutlineState[layerId] = color
    if (style.type !== LayerTypes.FILL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = rgbaString
    $map.setPaintProperty(layerId, propertyName, rgbaString)
    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.FILL}
  <StyleControlGroup title="Fill Outline Color">
    {#if showToolTip}
      <div class={showToolTip ? 'tooltipshown' : 'tooltiphidden'}>
        <DefaultColorPicker
          bind:color
          on:closeColorPicker={() => (showToolTip = false)}
          on:changeColor={setLineColor} />
      </div>
    {/if}
    <div
      use:Ripple={{ surface: true }}
      on:click={() => (showToolTip = !showToolTip)}
      style="width: 32px; height: 32px; cursor:pointer; border:1px solid grey; background: {rgbaString}" />
    <!--    <ColorPicker bind:RgbColor={RGBColor} />-->
  </StyleControlGroup>
{/if}
