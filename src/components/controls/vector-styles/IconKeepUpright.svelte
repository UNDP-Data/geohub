<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { Label } from '@smui/common'
  import FormField from '@smui/form-field'
  import SegmentedButton, { Segment } from '@smui/segmented-button'
  import Switch from '@smui/switch'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'icon-keep-upright'
  const propertyNameSymbolPlacement = 'symbol-placement'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let checked = style.layout && style.layout[propertyName] ? style.layout[propertyName] : false
  let choices = ['point', 'line', 'line-center']
  let selected =
    style.layout && style.layout[propertyNameSymbolPlacement] ? style.layout[propertyNameSymbolPlacement] : 'point'

  $: checked, setIconKeepUpright()
  $: selected, setSymbolPlacement()

  const setSymbolPlacement = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }

    newStyle.layout[propertyNameSymbolPlacement] = selected
    $map.setLayoutProperty(layerId, propertyNameSymbolPlacement, selected)

    dispatch('change')
  }

  const setIconKeepUpright = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = checked
    $map.setLayoutProperty(layerId, propertyName, checked)

    if (checked === true) {
      selected = 'line'
    } else {
      selected = 'point'
    }
    setSymbolPlacement()

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Icon Keep Upright">
    <FormField>
      <Switch bind:checked />
      <span slot="label">Enable icon keep upright</span>
    </FormField>
    <br />
    Symbol placement needs to be set 'line' or 'line-center' if this is enabled.
  </StyleControlGroup>
  <StyleControlGroup title="Symbol placement">
    <SegmentedButton segments={choices} let:segment singleSelect bind:selected>
      <Segment {segment}>
        <Label>{segment}</Label>
      </Segment>
    </SegmentedButton>
  </StyleControlGroup>
{/if}
