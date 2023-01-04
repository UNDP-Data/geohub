<script lang="ts">
  import VectorSymbolSimple from '$components/controls/VectorSymbolSimple.svelte'
  import type { Layer } from '$lib/types'

  export let layer: Layer
  export let defaultColor: string
</script>

<VectorSymbolSimple
  bind:layer
  bind:defaultColor />
