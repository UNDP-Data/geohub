<script lang="ts">
  import SegmentedButton, { Segment } from '@smui/segmented-button'
  import { Label } from '@smui/common'
  import { map } from '../../../stores'
  import type { Layer } from '../../../lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, LayerTypes } from '../../../lib/constants'
  import { createEventDispatcher } from 'svelte'
  import StyleControlGroup from '../../control-groups/StyleControlGroup.svelte'
  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues
  const propertyName = 'icon-overlap'

  let choices = ['never', 'always', 'cooperative']

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let selected = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'never'
  $: selected, setIconOverlap()

  const setIconOverlap = () => {
    if (style.type !== LayerTypes.SYMBOL) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.layout) {
      newStyle.layout = {}
    }
    newStyle.layout[propertyName] = selected
    $map.setLayoutProperty(layerId, propertyName, selected)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.SYMBOL}
  <StyleControlGroup title="Icon Overlap">
    <SegmentedButton segments={choices} let:segment singleSelect bind:selected>
      <Segment {segment}>
        <Label>{segment}</Label>
      </Segment>
    </SegmentedButton>
  </StyleControlGroup>
{/if}
