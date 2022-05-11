<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Ripple from '@smui/ripple'
  import { map } from '$stores'
  import type { Color, Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import DefaultColorPicker from '../../DefaultColorPicker.svelte'
  import chroma from 'chroma-js'
  import { rgb2hsv } from '$lib/helper'

  export let layer: Layer = LayerInitialValues
  let showToolTip = false

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'text-halo-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let rgbaString = style.paint && style.paint[propertyName] ? style.paint[propertyName] : `rgba(255,255,255,1)`

  let color: Color = {
    r: chroma(rgbaString).rgba()[0],
    g: chroma(rgbaString).rgba()[1],
    b: chroma(rgbaString).rgba()[2],
    a: chroma(rgbaString).rgba()[3],
    hex: chroma(rgbaString).hex('rgb'),
    h: rgb2hsv(chroma(rgbaString).rgb())[0],
    s: rgb2hsv(chroma(rgbaString).rgb())[1],
    v: rgb2hsv(chroma(rgbaString).rgb())[2],
  }

  const setTextHaloColor = () => {
    rgbaString = `rgba(${color.r},${color.g},${color.b},${color.a})`
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = rgbaString
    $map.setPaintProperty(layerId, propertyName, rgbaString)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Text Halo Color">
    {#if showToolTip}
      <div class={showToolTip ? 'tooltipshown' : 'tooltiphidden'}>
        <DefaultColorPicker
          bind:color
          on:closeColorPicker={() => (showToolTip = false)}
          on:changeColor={setTextHaloColor} />
      </div>
    {/if}
    <div
      use:Ripple={{ surface: true }}
      on:click={() => (showToolTip = !showToolTip)}
      style="width: 32px; height: 32px; cursor:pointer; border:1px solid grey; background: {rgbaString}" />
  </StyleControlGroup>
{/if}

<style lang="scss">
  @use '@material/image-list/index' as image-list;
</style>
