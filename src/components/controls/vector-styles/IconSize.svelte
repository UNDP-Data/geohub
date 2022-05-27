<script lang="ts">
  import { onMount } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'

  import NumberInput from '$components/controls/NumberInput.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-size'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let maxValue = 5
  let minValue = 0
  let stepValue = 0.25
  let value = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 1

  onMount(() => {
    value = layer.iconSize ? layer.iconSize : 1
    setValue()
  })

  const setValue = () => {
    $map.setLayoutProperty(layer.definition.id, propertyName, value)
    layer.iconSize = value
  }
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
