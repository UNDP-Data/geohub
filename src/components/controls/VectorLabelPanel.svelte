<script lang="ts">
  import Switch from '@smui/switch'
  import FormField from '@smui/form-field'
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'

  export let isLabelPanelVisible = false
  export let layer: Layer = LayerInitialValues
  let enabledTextLabel = false
</script>

{#if isLabelPanelVisible === true}
  <div class="action">
    <div>
      <FormField>
        <Switch bind:checked={enabledTextLabel} />
        <span slot="label">Enable text label</span>
      </FormField>
    </div>
    {#if enabledTextLabel === true}
      <div />
    {/if}
  </div>
{/if}

<style lang="scss">
  .action {
    margin-bottom: 25px;
  }
</style>
