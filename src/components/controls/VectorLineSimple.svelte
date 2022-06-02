<script lang="ts">
  import LineColor from '$components/controls/vector-styles/LineColor.svelte'
  import LinePattern from '$components/controls/vector-styles/LinePattern.svelte'
  import LineWidth from '$components/controls/vector-styles/LineWidth.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues
</script>

<div class="line-simple-container">
  <div class="columns">
    <div class="column is-5">
      <div class="has-text-centered pb-2">Line Color</div>
      <div class="is-flex is-justify-content-center bring-to-front">
        <LineColor bind:layer />
      </div>
    </div>
    <div class="column is-7">
      <div class="has-text-centered">Line Width</div>
      <div class="is-flex is-justify-content-center send-to-back">
        <LineWidth bind:layer />
      </div>
    </div>
  </div>

  <div class="is-divider separator mt-3 mb-3" style="margin-right: -56px;"/>

  <div class="columns line-pattern pl-2">
    <div class="column">
      <div class="pb-2">Line Pattern</div>
      <div class="is-flex is-justify-content-center">
        <LinePattern bind:layer />
      </div>
    </div>
  </div>
</div>

<style lang="scss">
</style>
