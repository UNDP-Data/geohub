<script lang="ts">
  import VectorPolygonSimple from '$components/controls/VectorPolygonSimple.svelte'
  import type { Layer } from '$lib/types'

  export let layer: Layer
  export let defaultFillColor: string
  export let defaultFillOutlineColor: string
</script>

<VectorPolygonSimple
  bind:layer
  bind:defaultFillColor
  bind:defaultFillOutlineColor />
