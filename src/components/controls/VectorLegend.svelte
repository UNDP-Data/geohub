<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Textfield from '@smui/textfield'
  import HelperText from '@smui/textfield/helper-text'
  import RangeSlider from 'svelte-range-slider-pips'
  import { ColorPicker, Color } from 'svelte-colorpick'
  import { onMount } from 'svelte'
  import { map } from '../../stores'
  import type { Layer, LayerDefinition } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import LegendSymbol from '@watergis/legend-symbol'
  import { rgb2hex } from '../../lib/rgb2hex'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const zoom = $map.getZoom()
  const style = $map.getStyle().layers.filter((layer: LayerDefinition) => layer.id === layerId)[0]

  let legendSymbolContainer: HTMLElement

  $: styleJSON = stringifyStyleJSON(style)

  let ZoomSliderValues = [0, 24]
  $: ZoomSliderValues, setMinMaxZoom()

  let LineWidthValues = [style.paint && style.paint['line-width'] ? style.paint['line-width'] : 1.0]
  $: LineWidthValues, setLineWidth()

  const lineRGBColor = [style.paint && style.paint['line-color'] ? style.paint['line-color'] : 'rgb(53, 175, 109)']
  let lineColor = Color.hex(rgb2hex(lineRGBColor[0]))
  $: lineColor, setLineColor()
  const setLineColor = () => {
    const rgb = `rgb(${lineColor.data.r}, ${lineColor.data.g}, ${lineColor.data.b})`
    const newStyle = JSON.parse(styleJSON)
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint['line-color'] = rgb
    styleJSON = stringifyStyleJSON(newStyle)
    $map.setPaintProperty(layerId, 'line-color', rgb)
  }

  const lineColorPickerSetting = {
    selectedDimension: 'rgb.r',
    tabbed: false,
    selectedTab: 'rgb',
    showMatrix: true,
    showSlidersGlobal: true,
    showHex: true,
    showNumeric: true,
    showLabels: true,
    showSliders: {
      'hsl.h': false,
      'hsl.s': false,
      'hsl.l': false,
      'hcl.h': false,
      'hcl.c': false,
      'hcl.l': false,
      'lab.l': false,
      'lab.a': false,
      'lab.b': false,
      'rgb.r': true,
      'rgb.g': true,
      'rgb.b': true,
    },
    selectDimensions: false,
    matrixWidth: 250,
    matrixHeight: 150,
    scrollbarHeight: 10,
  }

  onMount(() => {
    updateLegend()
  })

  const updateLegend = () => {
    const mapLayers = $map.getStyle().layers
    const mapLayerByLayerId = mapLayers.find((item: LayerDefinition) => item.id === layerId)

    let symbol = LegendSymbol({ zoom: zoom, layer: mapLayerByLayerId })
    legendSymbolContainer.innerHTML = ''
    if (symbol) {
      switch (symbol.element) {
        case 'div': {
          const div = document.createElement('div')
          if (
            symbol.attributes.style.backgroundImage &&
            !['url(undefined)', 'url(null)'].includes(symbol.attributes.style.backgroundImage)
          ) {
            const img = document.createElement('img')
            img.src = symbol.attributes.style.backgroundImage.replace('url(', '').replace(')', '')
            img.alt = layerId
            img.style.cssText = `height: 24px;`
            div.appendChild(img)
          }
          const divBackground = document.createElement('div')
          divBackground.style.backgroundColor = symbol.attributes.style.backgroundColor
          divBackground.style.backgroundPosition = symbol.attributes.style.backgroundPosition
          divBackground.style.backgroundSize = symbol.attributes.style.backgroundSize
          divBackground.style.backgroundRepeat = symbol.attributes.style.backgroundRepeat
          divBackground.style.opacity = symbol.attributes.style.opacity
          div.appendChild(divBackground)
          legendSymbolContainer.appendChild(div)
          break
        }
        case 'svg': {
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
          svg.style.cssText = 'height: 24px;'
          svg.setAttributeNS(null, 'version', '1.1')
          Object.keys(symbol.attributes).forEach((k) => {
            svg.setAttribute(k, symbol.attributes[k])
            let group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
            symbol.children.forEach((child) => {
              var c = document.createElementNS('http://www.w3.org/2000/svg', child.element)
              Object.keys(child.attributes).forEach((k2) => {
                c.setAttributeNS(null, k2, child.attributes[k2])
              })
              group.appendChild(c)
            })
            svg.appendChild(group)
          })
          legendSymbolContainer.appendChild(svg)
          break
        }
        default: {
          break
        }
      }
    }
  }

  const stringifyStyleJSON = (style) => {
    return JSON.stringify(style, null, 4)
  }

  const setMinMaxZoom = () => {
    const newStyle = JSON.parse(styleJSON)
    newStyle.minzoom = ZoomSliderValues[0]
    newStyle.maxzoom = ZoomSliderValues[1]
    styleJSON = stringifyStyleJSON(newStyle)
    $map.setLayerZoomRange(layerId, newStyle.minzoom, newStyle.maxzoom)
  }

  const setLineWidth = () => {
    const newStyle = JSON.parse(styleJSON)
    if (!newStyle.paint) {
      newStyle.paint = {}
    }
    newStyle.paint['line-width'] = LineWidthValues[0]
    styleJSON = stringifyStyleJSON(newStyle)
    $map.setPaintProperty(layerId, 'line-width', LineWidthValues[0])
  }

  const applyLayerStyle = () => {
    const newStyle = JSON.parse(styleJSON)
    if (newStyle.minzoom && newStyle.maxzoom) {
      $map.setLayerZoomRange(layerId, newStyle.minzoom, newStyle.maxzoom)
    }
    if (newStyle.paint) {
      Object.keys(newStyle.paint).forEach((key) => {
        const value = newStyle.paint[key]
        $map.setPaintProperty(layerId, key, value)
      })
    }
    if (newStyle.layout) {
      Object.keys(newStyle.layout).forEach((key) => {
        const value = newStyle.layout[key]
        $map.setLayoutProperty(layerId, key, value)
      })
    }
    updateLegend()
  }
</script>

<div>
  <div bind:this={legendSymbolContainer} />

  <p>Zoom Level</p>
  <div class="slider">
    <RangeSlider
      bind:values={ZoomSliderValues}
      float
      range
      min={0}
      max={24}
      step={1}
      pips
      first="1"
      last="20"
      rest={false} />
  </div>

  {#if style.type === 'line'}
    <p>Line Width</p>
    <div class="slider">
      <RangeSlider bind:values={LineWidthValues} float min={0} max={10} step={0.1} pips rest={false} />
    </div>
    <p>Line Color</p>
    <ColorPicker
      bind:color={lineColor}
      tabbed={lineColorPickerSetting.tabbed}
      selectedTab={lineColorPickerSetting.selectedTab}
      selectedDimension={lineColorPickerSetting.selectedDimension}
      showMatrix={lineColorPickerSetting.showMatrix}
      showSliders={lineColorPickerSetting.showSlidersGlobal && lineColorPickerSetting.showSliders}
      showHex={lineColorPickerSetting.showHex}
      showLabels={lineColorPickerSetting.showLabels}
      showNumeric={lineColorPickerSetting.showNumeric}
      selectDimensions={lineColorPickerSetting.selectDimensions}
      matrixWidth={lineColorPickerSetting.matrixWidth}
      matrixHeight={lineColorPickerSetting.matrixHeight}
      scrollbarHeight={lineColorPickerSetting.scrollbarHeight} />
  {/if}

  <hr />
  <Textfield textarea bind:value={styleJSON} label="style.json" style="width: 100%;" helperLine$style="width: 100%;">
    <HelperText slot="helper">style.json for the layer</HelperText>
  </Textfield>
  <div class="changeLegendButtonDiv">
    <Button class="changelegendbtn" variant="raised" on:click={() => applyLayerStyle()}>
      <LabelButton>Apply</LabelButton>
    </Button>
  </div>
</div>

<style lang="scss">
  :global(.changeLegendButtonDiv) {
    margin: 0 auto;
    padding-top: 10px;
    width: 80%;
    display: flex;
  }
  :global(.changelegendbtn) {
    text-transform: capitalize;
    height: 30px;
    width: 100%;
  }
  .slider {
    --range-handle-focus: #2196f3;
    --range-range-inactive: #2196f3;
    --range-handle-inactive: #2196f3;
    --range-handle: #2196f3;
  }

  .color-picker {
    —-picker-height: 200px;
    —-slider-width: 30px;
    —-picker-width: 100%;
  }
</style>
