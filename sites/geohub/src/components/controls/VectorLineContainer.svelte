<script lang="ts">
  import VectorLineSimple from '$components/controls/VectorLineSimple.svelte'
  import type { Layer } from '$lib/types'

  export let layer: Layer
  export let defaultColor: string
</script>

<VectorLineSimple
  bind:layer
  bind:defaultColor />
