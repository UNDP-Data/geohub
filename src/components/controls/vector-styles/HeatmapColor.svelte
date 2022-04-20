<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'

  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import ColorPicker from '../ColorPicker.svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import chroma from 'chroma-js'

  export let layer: Layer = LayerInitialValues

  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'heatmap-color'
  const defaultValue = [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(0, 0, 255, 0)',
    0.1,
    'royalblue',
    0.3,
    'cyan',
    0.5,
    'lime',
    0.7,
    'yellow',
    1,
    'red',
  ]
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let heatmapColor = style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultValue
  // $: heatmapColor, setHeatmapColor()

  let colorValues = []
  for (let i = 3; i < heatmapColor.length; i++) {
    const val = heatmapColor[i]
    if (typeof val === 'number') {
      colorValues.push({ seq: i, value: val })
    } else if (typeof val === 'string') {
      const rgb = chroma(val).rgb()
      colorValues[colorValues.length - 1].color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    }
  }
  $: colorValues, setColor()
  const setColor = () => {
    if (style.type !== LayerTypes.HEATMAP) return
    for (let i = 0; i < colorValues.length; i++) {
      const value = colorValues[i]
      heatmapColor[value.seq] = value.value
      let colorValue = value.color
      if (i === 0) {
        const rgb = chroma(value.color).rgb()
        colorValue = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0)`
      }
      heatmapColor[value.seq + 1] = colorValue
    }
    const newStyle = JSON.parse(JSON.stringify(style))
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint[propertyName] = heatmapColor
    $map.setPaintProperty(layerId, propertyName, heatmapColor)

    dispatch('change')
  }
</script>

{#if style.type === LayerTypes.HEATMAP}
  <StyleControlGroup title="Heatmap Color">
    <table>
      {#each colorValues as color}
        <tr>
          <td class="color-table-td"><ColorPicker bind:RgbColor={color.color} /></td>
          <td class="color-table-td">{color.value}</td>
        </tr>
      {/each}
    </table>
  </StyleControlGroup>
{/if}

<style>
  .color-table-td {
    text-align: center;
    vertical-align: middle;
    padding-right: 5px;
    padding-left: 5px;
  }
</style>
