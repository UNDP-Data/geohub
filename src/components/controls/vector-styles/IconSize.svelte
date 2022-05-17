<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import NumberInput from '$components/controls/NumberInput.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues
  const dispatch = createEventDispatcher()

  const setValue = () => {
    $map.setLayoutProperty(layer.definition.id, 'icon-size', value)
    dispatch('change')
  }

  let maxValue = 5
  let minValue = 0
  let stepValue = 1
  let value = 1
</script>

<NumberInput bind:value bind:minValue bind:maxValue bind:step={stepValue} on:change={setValue} />
