<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Label } from '@smui/common'
  import SegmentedButton, { Segment } from '@smui/segmented-button'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-overlap'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let choices = ['never', 'always', 'cooperative']
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
