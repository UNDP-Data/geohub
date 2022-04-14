<script lang="ts">
  import Switch from '@smui/switch'
  import FormField from '@smui/form-field'
  import { map } from '../../stores'
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import TextField from './vector-styles/TextField.svelte'
  import TextColor from './vector-styles/TextColor.svelte'
  import TextHaloCalor from './vector-styles/TextHaloCalor.svelte'
  import TextHaloWidth from './vector-styles/TextHaloWidth.svelte'

  export let isLabelPanelVisible = false
  export let layer: Layer = LayerInitialValues
  let enabledTextLabel = false
  $: enabledTextLabel, disableTextLabel()

  const disableTextLabel = () => {
    if (enabledTextLabel === true) return
    const layerId = layer.definition.id
    const layoutFields = ['text-field']
    layoutFields.forEach((prop) => {
      $map.setLayoutProperty(layerId, prop, undefined)
    })
  }

  let updateLegend = () => undefined

  const onStyleChange = () => {
    updateLegend()
  }
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
      <div>
        <TextField on:change={onStyleChange} {layer} />
        <TextColor on:change={onStyleChange} {layer} />
        <TextHaloCalor on:change={onStyleChange} {layer} />
        <TextHaloWidth on:change={onStyleChange} {layer} />
      </div>
    {/if}
  </div>
{/if}

<style lang="scss">
  .action {
    margin-bottom: 25px;
  }
</style>
