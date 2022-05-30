<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'

  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import NumberInput from '$components/controls/NumberInput.svelte'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'icon-offset'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let iconOffsetValues = style.layout && style.layout[propertyName] ? style.layout[propertyName] : [0, 0]
  let maxValue = 10
  let minValue = -10
  let step = 1
  let xValue = iconOffsetValues[0]
  let yValue = iconOffsetValues[1]

  $: xValue, setIconOffset()
  $: yValue, setIconOffset()

  const setIconOffset = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    iconOffsetValues = [xValue, yValue]
    newStyle.layout[propertyName] = iconOffsetValues
    $map.setLayoutProperty(layerId, propertyName, iconOffsetValues)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <div class="columns is-gapless" style="margin-bottom: 0;">
    <div class="column">
      <div class="is-flex is-justify-content-center">Horizontal</div>
      <div class="is-flex is-justify-content-center">
        <NumberInput bind:value={xValue} bind:minValue bind:maxValue bind:step />
      </div>
    </div>
    <div class="column">
      <div class="is-flex is-justify-content-center">Vertical</div>
      <div class="is-flex is-justify-content-center">
        <NumberInput bind:value={yValue} bind:minValue bind:maxValue bind:step />
      </div>
    </div>
  </div>
  <div class="columns is-gapless is-size-7" style="padding-left: 5px; padding-bottom: 5px; padding-top: 5px;">
    <div class="column">Icon offset from center point</div>
  </div>
{/if}

<style lang="scss">
  div {
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
</style>
