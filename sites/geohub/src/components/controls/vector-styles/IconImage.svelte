<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import type { LayerSpecification } from 'maplibre-gl'
  import LegendSymbol from '@watergis/legend-symbol'
  import { clickOutside } from 'svelte-use-click-outside'
  import chroma from 'chroma-js'
  import { hexToCSSFilter } from 'hex-to-css-filter'

  import IconImagePicker from '$components/controls/vector-styles/IconImagePicker.svelte'
  import IconImagePickerCard from '$components/controls/vector-styles/IconImagePickerCard.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { map, spriteImageList } from '$stores'

  export let layer: Layer = LayerInitialValues
  export let defaultColor: string = undefined

  const layerId = layer.id
  const propertyName = 'icon-image'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let iconImage = style?.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle'
  let isIconListPanelVisible = false
  let legendSymbolContainer: HTMLElement = document.createElement('div')

  onMount(async () => {
    if (!$map) return
    updateLegend()
    $map.on('icon-color:changed', updateLegend)
  })

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'auto',
      strategy: 'fixed',
    },
    [0, 0],
  ).init()

  const updateLegend = () => {
    $map.setLayoutProperty(layerId, propertyName, iconImage)
    $map.setPaintProperty(layerId, 'icon-halo-color', 'rgb(255,255,255)')
    $map.setPaintProperty(layerId, 'icon-halo-width', 1)
    const mapLayers = $map.getStyle().layers
    const mapLayerByLayerId = mapLayers.find((item: LayerSpecification) => item.id === layerId)

    const symbol = LegendSymbol && LegendSymbol({ zoom: $map.getZoom(), layer: mapLayerByLayerId })
    if (!legendSymbolContainer) {
      legendSymbolContainer = document.createElement('div')
    }
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
            img.style.cssText = `height: 20px;`
            div.appendChild(img)
          }
          const divBackground = document.createElement('div')
          divBackground.style.height = '20px'
          divBackground.style.width = '150px'
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
            $spriteImageList.find((icon) => {
              if (icon.alt === mapLayerByLayerId.layout['icon-image']) {
                const rgba = chroma(defaultColor).rgba()
                const cssFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex())
                const img = document.createElement('img')
                img.src = icon.src
                img.alt = icon.alt
                img.title = icon.alt
                img.style.cssText = `height: 24px; width: 24px; filter: ${cssFilter?.filter}`
                legendSymbolContainer.appendChild(img)
              }
            })
          } else {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
            svg.style.cssText = 'height: 20px;'
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

  const handleClosePopup = () => {
    isIconListPanelVisible = !isIconListPanelVisible
  }

  const handleIconClick = (event: CustomEvent) => {
    if (event?.detail?.spriteImageAlt) {
      iconImage = event.detail.spriteImageAlt
      updateLegend()
    }
  }
</script>

<div
  class="icon-button"
  use:popperRef
  on:click={handleClosePopup}>
  <IconImagePickerCard
    bind:legendSymbolContainer
    iconImageAlt={iconImage} />
</div>

{#if isIconListPanelVisible}
  <div
    id="tooltip"
    data-testid="tooltip"
    use:popperContent={popperOptions}
    use:clickOutside={handleClosePopup}
    transition:fade>
    <IconImagePicker
      on:handleIconClick={handleIconClick}
      on:handleClosePopup={handleClosePopup}
      iconImageAlt={iconImage} />

    <div
      id="arrow"
      data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  @import '../../../styles/popper.scss';

  .icon-button {
    width: 65px;
  }

  #tooltip {
    max-width: 440px;
  }
</style>
