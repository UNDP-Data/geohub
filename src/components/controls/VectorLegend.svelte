<script lang="ts">
  import { onMount } from 'svelte'
  import { map } from '../../stores'
  import type { Layer, LayerDefinition } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'
  import LegendSymbol from '@watergis/legend-symbol'

  export let layer: Layer = LayerInitialValues
  const layerId = layer.definition.id
  const zoom = $map.getZoom()
  const style = $map.getStyle().layers.filter((layer: LayerDefinition) => layer.id === layerId)

  let legendSymbolContainer: HTMLElement

  onMount(() => {
    const mapLayers = $map.getStyle().layers
    const mapLayerByLayerId = mapLayers.find((item: LayerDefinition) => item.id === layerId)

    let symbol = LegendSymbol({ zoom: zoom, layer: mapLayerByLayerId })
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
  })
</script>

<div>
  <div bind:this={legendSymbolContainer} />
  <textarea value={JSON.stringify(style, null, 2)} />
</div>

<style lang="scss">
  textarea {
    resize: vertical;
    width: 100%;
    height: 150px;
    min-height: 50px;
    max-height: 300px;
  }
</style>
