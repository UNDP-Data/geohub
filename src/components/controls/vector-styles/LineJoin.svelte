<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import SegmentedButton, { Segment } from '@smui/segmented-button'
  import { Label } from '@smui/common'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'line-join'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let choices = ['bevel', 'round', 'miter']
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
