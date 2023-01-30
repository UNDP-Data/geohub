<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import type { LayerSpecification } from 'maplibre-gl'
  import { clickOutside } from 'svelte-use-click-outside'
  import chroma from 'chroma-js'
  import { hexToCSSFilter } from 'hex-to-css-filter'

  import IconImagePicker from '$components/controls/vector-styles/IconImagePicker.svelte'
  import IconImagePickerCard from '$components/controls/vector-styles/IconImagePickerCard.svelte'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { map, spriteImageList } from '$stores'
  import { getLayerStyle } from '$lib/helper'

  export let layer: Layer
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
    const layerStyle = getLayerStyle($map, layerId)

    if (!legendSymbolContainer) {
      legendSymbolContainer = document.createElement('div')
    }
    legendSymbolContainer.innerHTML = ''

    if (layerStyle.layout && layerStyle.layout['icon-image']) {
      const icon = $spriteImageList.find((icon) => icon.alt === layerStyle.layout['icon-image'])
      if (icon) {
        const rgba = chroma(defaultColor).rgba()
        const cssFilter = hexToCSSFilter(chroma([rgba[0], rgba[1], rgba[2]]).hex())
        const img = document.createElement('img')
        img.src = icon.src
        img.alt = icon.alt
        img.title = icon.alt
        img.style.cssText = `height: 24px; width: 24px; filter: ${cssFilter?.filter}`
        legendSymbolContainer.appendChild(img)
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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleClosePopup()
    }
  }
</script>

<div
  class="icon-button"
  use:popperRef
  on:keydown={handleKeyDown}
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
