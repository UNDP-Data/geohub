<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Switch from '@smui/switch'
  import FormField from '@smui/form-field'
  import { map } from '../../stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import TextField from '$components/controls/vector-styles/TextField.svelte'
  import TextColor from '$components/controls/vector-styles/TextColor.svelte'
  import TextHaloCalor from '$components/controls/vector-styles/TextHaloCalor.svelte'
  import TextHaloWidth from '$components/controls/vector-styles/TextHaloWidth.svelte'
  import TextMaxWidth from '$components/controls/vector-styles/TextMaxWidth.svelte'
  import TextSize from '$components/controls/vector-styles/TextSize.svelte'

  export let isLabelPanelVisible = false
  export let layer: Layer = LayerInitialValues
  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  let enabledTextLabel = false
  $: enabledTextLabel, disableTextLabel()

  const disableTextLabel = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    if (enabledTextLabel === true) return
    const layoutFields = [
      'text-field',
      'text-variable-anchor',
      'text-radial-offset',
      'text-justify',
      'text-size',
      'text-max-width',
    ]
    layoutFields.forEach((prop) => {
      if (!$map.getLayoutProperty(layerId, prop)) return
      $map.setLayoutProperty(layerId, prop, undefined)
    })

    const paintFields = ['text-color', 'text-halo-color', 'text-halo-width']
    paintFields.forEach((prop) => {
      if (!$map.getPaintProperty(layerId, prop)) return
      $map.setPaintProperty(layerId, prop, undefined)
    })
  }

  let updateLegend = () => undefined

  const onStyleChange = () => {
    updateLegend()
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
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
          <TextSize on:change={onStyleChange} {layer} />
          <TextHaloCalor on:change={onStyleChange} {layer} />
          <TextHaloWidth on:change={onStyleChange} {layer} />
          <TextMaxWidth on:change={onStyleChange} {layer} />
        </div>
      {/if}
    </div>
  {/if}
{/if}

<style lang="scss">
  .action {
    margin-bottom: 25px;
  }
</style>
