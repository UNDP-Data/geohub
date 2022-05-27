<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types.g'
  import LegendSymbol from '@watergis/legend-symbol'
  import { createPopperActions } from 'svelte-popperjs'

  import IconImagePicker from '$components/controls/vector-styles/IconImagePicker.svelte'
  import IconImagePickerCard from '$components/controls/vector-styles/IconImagePickerCard.svelte'
  import { LayerInitialValues } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { map, spriteImageList } from '$stores'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const propertyName = 'icon-image'
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let iconImage = style.layout && style.layout[propertyName] ? style.layout[propertyName] : 'circle'
  let isIconListPanelVisible = false
  let legendSymbolContainer: HTMLElement = document.createElement('div')

  onMount(async () => {
    updateLegend()
  })

  const updateLegend = () => {
    $map.setLayoutProperty(layerId, propertyName, iconImage)
    $map.setPaintProperty(layerId, 'icon-halo-color', 'rgb(255,255,255)')
    $map.setPaintProperty(layerId, 'icon-halo-width', 1)
    const mapLayers = $map.getStyle().layers
    const mapLayerByLayerId = mapLayers.find((item: LayerSpecification) => item.id === layerId)

    const symbol = LegendSymbol({ zoom: $map.getZoom(), layer: mapLayerByLayerId })
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
                const img = document.createElement('img')
                img.src = icon.src
                img.alt = layerId
                img.style.cssText = `height: 24px; width: 24px;`
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

  const [popperRef, popperContent] = createPopperActions({
    placement: 'right-end',
    strategy: 'fixed',
  })

  const popperOptions = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [-25, -5],
        },
      },
    ],
  }
</script>

<div class="icon-button" use:popperRef on:click={handleClosePopup}>
  <IconImagePickerCard bind:legendSymbolContainer iconImageAlt={iconImage} />
</div>

{#if isIconListPanelVisible}
  <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
    <IconImagePicker
      on:handleIconClick={handleIconClick}
      on:handleClosePopup={handleClosePopup}
      iconImageAlt={iconImage} />

    <div id="arrow" data-popper-arrow />
  </div>
{/if}

<style lang="scss">
  .icon-button {
    width: 65px;
  }

  $tooltip-background: #fff;

  #tooltip {
    background: $tooltip-background;
    border-radius: 7.5px;
    border: 1px solid #ccc;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    font-size: 13px;
    max-height: 460px;
    max-width: 440px;
    padding-top: 10px;
    padding: 15px;
    position: absolute;
    inset: -10px auto auto 0px !important;
    width: 460px;

    @media (prefers-color-scheme: dark) {
      background: #212125;
    }

    #arrow,
    #arrow::before {
      background: $tooltip-background;
      height: 18px;
      left: -4.5px;
      position: absolute;
      width: 18px;

      @media (prefers-color-scheme: dark) {
        background: #212125;
      }
    }

    #arrow {
      visibility: visible;
    }

    #arrow::before {
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
      content: '';
      transform: rotate(45deg);
      visibility: visible;
    }
  }
</style>
