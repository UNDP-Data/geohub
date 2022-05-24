<script lang="ts">
  import { onMount } from 'svelte'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import chroma from 'chroma-js'

  import HeatmapColorRow from '$components/controls/vector-styles/HeatmapColorRow.svelte'
  import { LayerInitialValues, LayerTypes } from '$lib/constants'
  import type { Color, Layer } from '$lib/types'
  import { map } from '$stores'

  export let layer: Layer = LayerInitialValues
  let colorPickerVisibleIndex: number

  const layerId = layer.definition.id
  const propertyName = 'heatmap-color'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  const heatMapDataColorIndexStart = 3
  const heatMapDefaultValues = [
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

  let colorValues = []
  let heatMapValues = style.paint && style.paint[propertyName] ? style.paint[propertyName] : heatMapDefaultValues

  onMount(() => {
    colorValues = getColorValues()
  })

  const getColorValues = () => {
    const colorRows = heatMapValues.slice(heatMapDataColorIndexStart)
    const colorRowsValues = []
    colorRows.map((value: string, index: number) => {
      if (index % 2 === 0) {
        colorRowsValues.push({
          index: index / 2,
          value,
          color: generateColorObject(colorRows[index + 1]) as Color,
        })
      }
    })

    return colorRowsValues
  }

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

  const handleChangeColorMap = () => {
    if (style.type !== LayerTypes.HEATMAP) return

    colorValues.forEach((row) => {
      const colorValue = `rgba(${row.color.r},${row.color.g},${row.color.b},${row.index === 0 ? 0 : row.color.a})`
      heatMapValues[row.index * 2 + heatMapDataColorIndexStart + 1] = colorValue
    })

    $map.setPaintProperty(layerId, propertyName, heatMapValues)
  }

  const handleColorPickerClick = (event: CustomEvent) => {
    colorPickerVisibleIndex = event.detail.index
  }
</script>

{#if style.type === LayerTypes.HEATMAP}
  {#each colorValues as colorValueRow}
    <HeatmapColorRow
      bind:colorRow={colorValueRow}
      {colorPickerVisibleIndex}
      on:clickColorPicker={handleColorPickerClick}
      on:changeColorMap={handleChangeColorMap} />
  {/each}
{/if}
