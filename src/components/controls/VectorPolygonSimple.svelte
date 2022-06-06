<script lang="ts">
  import FillColor from '$components/controls/vector-styles/FillColor.svelte'
  import FillOutlineColor from '$components/controls/vector-styles/FillOutlineColor.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues
</script>

<div class="line-simple-container">
  <div class="columns">
    <div class="column is-5">
      <div class="has-text-centered pb-2">Fill Color</div>
      <div class="is-flex is-justify-content-center bring-to-front">
        <FillColor bind:layer />
      </div>
    </div>
    <div class="column is-7">
      <div class="has-text-centered pb-2">Fill Outline Color</div>
      <div class="is-flex is-justify-content-center send-to-back">
        <FillOutlineColor bind:layer />
      </div>
    </div>
  </div>
</div>

<style lang="scss">
</style>
