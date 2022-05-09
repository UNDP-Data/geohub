<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import chroma from 'chroma-js'
  import DefaultColorPicker from '../../DefaultColorPicker.svelte'
  import Ripple from '@smui/ripple'

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
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  let heatmapColor = style.paint && style.paint[propertyName] ? style.paint[propertyName] : defaultValue
  let showToolTip = false
  let colorIndex

  const generateColorObject = (rgbColor: string) => {
    let String = rgbColor.replace('rgba(', '').replace('rgb(', '').replace(')', '')
    let rgbArray = String.split(',')
    let r = parseInt(rgbArray[0])
    let g = parseInt(rgbArray[1])
    let b = parseInt(rgbArray[2])
    return {
      r,
      g,
      b,
      hex: chroma([r, g, b]).hex('rgb'),
      h: chroma([r, g, b]).hsv()[0],
      s: chroma([r, g, b]).hsv()[1],
      v: chroma([r, g, b]).hsv()[2],
    }
  }

  let colorValues = []
  for (let i = 3; i < heatmapColor.length; i++) {
    const val = heatmapColor[i]
    if (typeof val === 'number') {
      colorValues.push({ seq: i, value: val })
    } else if (typeof val === 'string') {
      colorValues[colorValues.length - 1].color = generateColorObject(val)
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
      let colorValue = `rgb(${r},${g},${b})`
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
</script>

{#if style.type === LayerTypes.HEATMAP}
  <StyleControlGroup title="Heatmap Color">
    <table>
      {#each colorValues as colorValue, index}
        <tr>
          <td className="color-table-td">
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
              style="width: 32px; height: 32px; border:1px solid grey; cursor:pointer; background: rgb({colorValues[
                index
              ].color.r},{colorValues[index].color.g},{colorValues[index].color.b})" />
            <!--            <ColorPicker bind:RgbColor={color.color} />-->
          </td>
          <td className="color-table-td"
            >{colorValues[index].color.r},{colorValues[index].color.g},{colorValues[index].color.b}</td>
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
