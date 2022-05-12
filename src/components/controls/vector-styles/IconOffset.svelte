<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'
  import NumberInput from '../NumberInput.svelte'

  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-offset'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let iconOffsetValues = style.layout && style.layout[propertyName] ? style.layout[propertyName] : [0, 0]
  let xValue = iconOffsetValues[0]
  let yValue = iconOffsetValues[1]
  let minValue = -10
  let maxValue = 10
  let step = 1

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
  <div class="columns is-flex is-vcentered">
    <div class="column is-2">
      <div class="is-size-6">X offset</div>
    </div>
    <div class="column">
      <NumberInput bind:value={xValue} bind:minValue bind:maxValue bind:step />
    </div>
    <div class="column is-2">
      <div class="is-size-6">Y offset</div>
    </div>
    <div class="column">
      <NumberInput bind:value={yValue} bind:minValue bind:maxValue bind:step />
    </div>
  </div>
{/if}

<style lang="scss">
</style>
