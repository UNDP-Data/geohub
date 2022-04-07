<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import LegendSymbol from '@watergis/legend-symbol'

  import { onMount } from 'svelte'
  import { map } from '../../stores'
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import { loadImageToDataUrl, loadJson, clipSprite } from '../../lib/helper'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const zoom = $map.getZoom()

  let sprite = {
    dataUrl: null,
    json: null,
  }
  let legendSymbolContainer: HTMLElement

  const styleUrl = $map.getStyle().sprite

  let iconList = []

  onMount(async () => {
    const promise = Promise.all([loadImageToDataUrl(`${styleUrl}@2x.png`), loadJson(`${styleUrl}@2x.json`)])
    await promise.then(([dataUrl, json]) => {
      sprite.dataUrl = dataUrl
      sprite.json = json
    })
    const promises = []
    Object.keys(sprite.json).forEach((id) => {
      promises.push(clipSprite(sprite.dataUrl, id, sprite.json[id]))
    })
    iconList = await Promise.all(promises)
    updateLegend()
  })

  export const updateLegend = () => {
    const mapLayers = $map.getStyle().layers
    const mapLayerByLayerId = mapLayers.find((item: LayerSpecification) => item.id === layerId)

    const symbol = LegendSymbol({ zoom: zoom, layer: mapLayerByLayerId })
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
          if (mapLayerByLayerId.layout && mapLayerByLayerId.layout['icon-image']) {
            iconList.forEach((icon) => {
              if (icon.alt === mapLayerByLayerId.layout['icon-image']) {
                const img = document.createElement('img')
                img.src = icon.src
                img.alt = layerId
                img.style.cssText = `height: 24px;`
                legendSymbolContainer.appendChild(img)
              }
            })
          } else {
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
          }
          break
        }
        default: {
          break
        }
      }
    }
  }
</script>

<div bind:this={legendSymbolContainer} />

<style lang="scss">
</style>
