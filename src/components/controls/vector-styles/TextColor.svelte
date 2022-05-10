<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Ripple from '@smui/ripple'
  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import DefaultColorPicker from '../../DefaultColorPicker.svelte'
  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  let color
  let showToolTip = false

  const layerId = layer.definition.id
  const propertyName = 'text-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  // let TextColor = style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(0, 0, 0)'
  let rgbaString = style.paint && style.paint[propertyName] ? style.paint[propertyName] : 'rgb(0, 0, 0)'

  // $: TextColor, setTextColor()

  const setTextColor = () => {
    rgbaString = `rgba(${color.r},${color.g},${color.b})`
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
