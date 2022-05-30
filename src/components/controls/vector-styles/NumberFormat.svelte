<script lang="ts">
  import NumberInput from '../NumberInput.svelte'

  export let decimalPoisition = 0

  let maxValue = 10
  let minValue = 1
  let stepValue = 1
</script>

<NumberInput bind:value={decimalPoisition} bind:minValue bind:maxValue bind:step={stepValue} />
