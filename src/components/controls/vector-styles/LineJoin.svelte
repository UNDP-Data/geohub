<script lang="ts">
  import SegmentedButton, { Segment } from '@smui/segmented-button'
  import { Label } from '@smui/common'
  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import { createEventDispatcher } from 'svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues
  const propertyName = 'line-join'

  let choices = ['bevel', 'round', 'miter']

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let selected = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'miter'
  $: selected, setLineJoin()

  const setLineJoin = () => {
    if (style.type !== LayerTypes.LINE) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = selected
    $map.setLayoutProperty(layerId, propertyName, selected)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.LINE}
  <StyleControlGroup title="Line Join">
    <SegmentedButton segments={choices} let:segment singleSelect bind:selected>
      <Segment {segment}>
        <Label>{segment}</Label>
      </Segment>
    </SegmentedButton>
  </StyleControlGroup>
{/if}
