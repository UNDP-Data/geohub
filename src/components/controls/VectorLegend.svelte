<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Textfield from '@smui/textfield'
  import HelperText from '@smui/textfield/helper-text'
  import { onMount } from 'svelte'
  import { map } from '../../stores'
  import type { Layer } from '../../lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues } from '../../lib/constants'
  import { stringifyStyleJSON } from '../../lib/helper'
  import LegendSymbol from '@watergis/legend-symbol'
  import MinMaxZoom from './vector-styles/MinMaxZoom.svelte'
  import LineWidth from './vector-styles/LineWidth.svelte'
  import LineBlur from './vector-styles/LineBlur.svelte'
  import LineColor from './vector-styles/LineColor.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const zoom = $map.getZoom()
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
  let sprite = {
    image: HTMLImageElement,
    json: JSON,
  }

  let legendSymbolContainer: HTMLElement

  $: styleJSON = stringifyStyleJSON(style)

  const setSprite = (image: any, json: JSON) => {
    sprite = {
      image,
      json,
    }
  }

  const loadImage = (url: string) => {
    let cancelled = false
    const promise = new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.onload = () => {
        if (!cancelled) resolve(img)
      }
      img.onerror = (e) => {
        if (!cancelled) reject(e)
      }
      img.src = url
    })
    return promise
  }

  const loadJson = async (url: string) => {
    return fetch(url).then((data) => data.json())
  }

  const styleUrl = $map.getStyle().sprite
  const promise = Promise.all([loadImage(`${styleUrl}.png`), loadJson(`${styleUrl}.json`)])

  onMount(async () => {
    await promise.then(([image, json]) => {
      setSprite(image, json)
    })
    updateLegend()
  })

  const updateLegend = () => {
    const mapLayers = $map.getStyle().layers
    const mapLayerByLayerId = mapLayers.find((item: LayerSpecification) => item.id === layerId)

    let symbol = LegendSymbol({ sprite: sprite, zoom: zoom, layer: mapLayerByLayerId })
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
          divBackground.style.height = '24px'
          divBackground.style.width = '50px'
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

  const onStyleChange = () => {
    const _style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]
    styleJSON = stringifyStyleJSON(_style)
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

  <MinMaxZoom on:change={onStyleChange} {layer} />
  <LineWidth on:change={onStyleChange} {layer} />
  <LineBlur on:change={onStyleChange} {layer} />
  <LineColor on:change={onStyleChange} {layer} />

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
</style>
