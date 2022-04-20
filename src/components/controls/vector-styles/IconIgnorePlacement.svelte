<script lang="ts">
  import Switch from '@smui/switch'
  import FormField from '@smui/form-field'
  import { map } from '../../../stores'
  import type { Layer } from '$lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import { createEventDispatcher } from 'svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues
  const propertyName = 'icon-ignore-placement'

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let checked = style.layout && style.layout[propertyName] ? style.layout[propertyName] : false
  $: checked, setIconKeepUpright()

  const setIconKeepUpright = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = checked
    $map.setLayoutProperty(layerId, propertyName, checked)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Icon Ignore Placement">
    <FormField>
      <Switch bind:checked />
      <span slot="label">Enable icon ignore placement</span>
    </FormField>
  </StyleControlGroup>
{/if}
