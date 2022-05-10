<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import Ripple from '@smui/ripple'
  import DefaultColorPicker from '../../DefaultColorPicker.svelte'

  let showToolTip
  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'fill-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let color
  let rgbaString = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(20, 180, 60)'][0]

  const setLineColor = () => {
    rgbaString = `rgba(${color.r},${color.g},${color.b},${color.a})`
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
