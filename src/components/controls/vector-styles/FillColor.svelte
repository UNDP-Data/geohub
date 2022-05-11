<script lang="ts" context="module">
  let fillState = {}
</script>

<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Ripple from '@smui/ripple'
  import chroma from 'chroma-js'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import DefaultColorPicker from '$components/DefaultColorPicker.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'fill-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  // Default Value for color object
  const r = 20
  const g = 180
  const b = 60
  const a = 1

  let color
  let showToolTip = false
  let rgbaString = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : `rgba(${r}, ${g}, ${b})`][0]

  if (!Object.keys(fillState).length) {
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
    color = fillState[layerId]
  }

  const setLineColor = () => {
    rgbaString = `rgba(${color.r},${color.g},${color.b},${color.a})`
    fillState[layerId] = color
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
  <StyleControlGroup title="Fill Color">
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
      style="width: 32px; height: 32px; border:1px solid grey; cursor:pointer; background: {rgbaString}" />
    <!--    <ColorPicker bind:RgbColor={RGBColor} />-->
  </StyleControlGroup>
{/if}
