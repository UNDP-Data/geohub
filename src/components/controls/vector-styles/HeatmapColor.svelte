<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import chroma from 'chroma-js'
  import Ripple from '@smui/ripple'

  import DefaultColorPicker from '$components/DefaultColorPicker.svelte'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues

  const defaultValue = [
    'interpolate',
    ['linear'],
    ['heatmap-density'],
    0,
    'rgba(0, 0, 255, 0)',
    0.1,
    'rgb(0,0,255)',
    0.3,
    'rgb(0,255,255)',
    0.5,
    'rgb(0,255,0)',
    0.7,
    'rgb(255,255,0)',
    1,
    'rgb(255,0,0)',
  ]
  const dispatch = createEventDispatcher()
  const layerId = layer.definition.id
  const propertyName = 'heatmap-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let colorIndex: number
  let colorValues = []
  let heatmapColor = style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultValue
  let showToolTip = false

  const generateColorObject = (rgbColor: string) => {
    let String = rgbColor.replace('rgba(', '').replace('rgb(', '').replace(')', '')
    let rgbArray = String.split(',')
    let r = parseInt(rgbArray[0])
    let g = parseInt(rgbArray[1])
    let b = parseInt(rgbArray[2])
    let a = 1
    return {
      r,
      g,
      b,
      a,
      hex: chroma([r, g, b]).hex('rgb'),
      h: chroma([r, g, b]).hsv()[0],
      s: chroma([r, g, b]).hsv()[1],
      v: chroma([r, g, b]).hsv()[2],
    }
  }

  const setColor = () => {
    if (style.type !== LayerTypes.HEATMAP) return
    for (let i = 0; i < colorValues.length; i++) {
      const value = colorValues[i]
      heatmapColor[value.seq] = value.value
      const r = value.color.r
      const g = value.color.g
      const b = value.color.b
      const a = value.color.a
      let colorValue = `rgba(${r},${g},${b},${a})`
      if (i === 0) {
        const rgb = [value.color.r, value.color.g, value.color.b]
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

  for (let i = 3; i < heatmapColor.length; i++) {
    const val = heatmapColor[i]
    if (typeof val === 'number') {
      colorValues.push({ seq: i, value: val })
    } else if (typeof val === 'string') {
      colorValues[colorValues.length - 1].color = generateColorObject(val)
    }
  }

  console.log(colorValues)
</script>

{#if style.type === LayerTypes.HEATMAP}
  <StyleControlGroup title="Heatmap Color">
    <table>
      {#each colorValues as colorValue, index}
        <tr>
          <td class="color-table-td">
            {#if showToolTip}
              <div class={showToolTip && colorIndex === index ? 'tooltipshown' : 'tooltiphidden'}>
                <DefaultColorPicker
                  bind:color={colorValues[index].color}
                  on:closeColorPicker={() => (showToolTip = false)}
                  on:changeColor={setColor} />
              </div>
            {/if}
            <div
              use:Ripple={{ surface: true }}
              on:click={() => {
                showToolTip = !showToolTip
                colorIndex = index
              }}
              style="width: 32px; height: 32px; border:1px solid grey; cursor:pointer; background: rgba({colorValues[
                index
              ].color.r},{colorValues[index].color.g},{colorValues[index].color.b}, {colorValues[index].color.a})" />
          </td>
          <td class="color-table-td"
            >rgba({colorValues[index].color.r},{colorValues[index].color.g},{colorValues[index].color.b}, {colorValues[
              index
            ].color.a})</td>
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
  :global(.tooltiphidden) {
    display: none !important;
  }
</style>
