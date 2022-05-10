<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { createEventDispatcher } from 'svelte'

  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  // import ColorPicker from '../ColorPicker.svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import DefaultColorPicker from '../../DefaultColorPicker.svelte'
  import Ripple from '@smui/ripple'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'line-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let color
  let showToolTip = false
  let rgbaString = [style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(53, 175, 109)'][0]

  const setLineColor = () => {
    rgbaString = `rgba(${color.r},${color.g},${color.b},${color.a})`
    if (style.type !== LayerTypes.LINE) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = rgbaString
    $map.setPaintProperty(layerId, propertyName, rgbaString)
    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.LINE}
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
  </StyleControlGroup>
{/if}
