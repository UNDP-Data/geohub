<script lang="ts" context="module">
  let textState = {}
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
  const propertyName = 'text-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  const r = 0
  const g = 0
  const b = 0
  const a = 1
  let color
  if (!Object.keys(textState).length) {
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
    color = textState[layerId]
  }

  let showToolTip = false

  // let TextColor = style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(0, 0, 0)'
  let rgbaString = style.paint && style.paint[propertyName] ? style.paint[propertyName] : `rgb(${r}, ${g}, ${b})`

  // $: TextColor, setTextColor()

  const setTextColor = () => {
    rgbaString = `rgba(${color.r},${color.g},${color.b})`
    textState[layerId] = color
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
  <StyleControlGroup title="Text Color">
    {#if showToolTip}
      <div class={showToolTip ? 'tooltipshown' : 'tooltiphidden'}>
        <DefaultColorPicker
          bind:color
          on:closeColorPicker={() => (showToolTip = false)}
          on:changeColor={setTextColor} />
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
