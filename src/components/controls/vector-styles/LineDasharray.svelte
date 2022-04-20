<script lang="ts">
  import Select, { Option } from '@smui/select'
  import { map } from '../../../stores'
  import type { Layer } from '$lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import { createEventDispatcher } from 'svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  const dispatch = createEventDispatcher()

  export let layer: Layer = LayerInitialValues
  const propertyName = 'line-dasharray'
  const lineTypes = [
    { title: 'solid line', value: [1] },
    { title: 'dashed line', value: [10, 4] },
    { title: 'dashed-dotted line', value: [10, 3, 2, 3] },
    { title: 'dotted line', value: [1, 5, 1] },
  ]

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let LineDasharrayValue = style.paint && style.paint[propertyName] ? style.paint[propertyName] : lineTypes[0].value
  $: LineDasharrayValue, setLineDasharray()

  const setLineDasharray = () => {
    if (style.type !== LayerTypes.LINE) return
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = LineDasharrayValue
    $map.setPaintProperty(layerId, propertyName, LineDasharrayValue)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.LINE}
  <StyleControlGroup title="Line Dasharray">
    <Select bind:value={LineDasharrayValue}>
      {#each lineTypes as type}
        <Option value={type.value}>{type.title}</Option>
      {/each}
    </Select>
  </StyleControlGroup>
{/if}
