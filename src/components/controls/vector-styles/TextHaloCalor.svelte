<script lang="ts" context="module">
  let textHaloState = {}
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

  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues
  let showToolTip = false
  const layerId = layer.definition.id
  const propertyName = 'text-halo-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let TextHaloColor = style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(255, 255, 255)'

  const r = 255
  const g = 255
  const b = 255
  const a = 1
  let color
  if (!Object.keys(textHaloState).length) {
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
    color = textHaloState[layerId]
  }

  const setTextHaloColor = () => {
    TextHaloColor = `rgba(${color.r},${color.g},${color.b},${color.a})`
    textHaloState[layerId] = color
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
      style="width: 32px; height: 32px; cursor:pointer; border:1px solid grey; background: {TextHaloColor}" />
  </StyleControlGroup>
{/if}

<style lang="scss">
  @use '@material/image-list/index' as image-list;
</style>
