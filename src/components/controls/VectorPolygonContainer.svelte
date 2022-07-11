<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { cloneDeep } from 'lodash-es'

  import ColorMapPicker from '$components/ColorMapPicker.svelte'
  import VectorPolygonSimple from '$components/controls/VectorPolygonSimple.svelte'
  import VectorPolygonAdvanced from '$components/controls/VectorPolygonAdvanced.svelte'
  import {
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    DEFAULT_COLORMAP,
    VectorLayerPolygonLegendTypes,
  } from '$lib/constants'
  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import { layerList } from '$stores'

  export let layer: Layer

  let colorPickerVisibleIndex: number
  let isLegendSwitchAnimate = false
  let layerListCount = $layerList.length
  let layerMin: number
  let layerMax: number
  let showTooltip = false
  let layerNumberProperties = 0

  // hide colormap picker if change in layer list
  $: {
    if (layerListCount !== $layerList.length) {
      showTooltip = false
      layerListCount = $layerList.length
    }
  }

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-end',
      strategy: 'fixed',
    },
    [10, 15],
  ).init()

  onMount(() => {
    // set default values
    layer.legendType = layer.legendType ? layer.legendType : VectorLayerPolygonLegendTypes.SIMPLE
    layer.colorMapName = layer.colorMapName ? layer.colorMapName : DEFAULT_COLORMAP

    if (layer?.intervals === undefined) {
      layer.intervals = {
        classification: ClassificationMethodTypes.NATURAL_BREAK,
        numberOfClasses: COLOR_CLASS_COUNT,
        colorMapRows: [],
        propertyName: '',
      }
    }

    layerNumberProperties = getLayerNumberProperties()
  })

  const handleLegendToggleClick = () => {
    colorPickerVisibleIndex = -1
    isLegendSwitchAnimate = true

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    if (layer.legendType === VectorLayerPolygonLegendTypes.SIMPLE) {
      layer.legendType = VectorLayerPolygonLegendTypes.ADVANCED
    } else {
      layer.legendType = VectorLayerPolygonLegendTypes.SIMPLE
    }
  }

  const handleColorMapClick = (event: CustomEvent) => {
    if (event?.detail?.colorMapName) {
      const layerClone = cloneDeep(layer)
      layerClone.colorMapName = event.detail.colorMapName
      layer = layerClone
      colorPickerVisibleIndex = -1
    }
  }

  const handleClosePopup = () => {
    showTooltip = !showTooltip
    colorPickerVisibleIndex = -1
  }

  const getLayerNumberProperties = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const vectorLayerMeta = JSON.parse(
      JSON.stringify(layer.info.json.vector_layers.find((l) => l.id === layer.definition['source-layer'])),
    )
    Object.keys(vectorLayerMeta.fields).forEach((key) => {
      if (vectorLayerMeta.fields[key] !== 'Number') {
        delete vectorLayerMeta.fields[key]
      }
    })

    return Object.keys(vectorLayerMeta.fields).length
  }
</script>

<div class="columns" data-testid="polygon-view-container">
  <div class={`column ${layerNumberProperties > 0 ? 'is-10' : 'is-12'}`}>
    {#if layer.legendType === VectorLayerPolygonLegendTypes.SIMPLE}
      <div transition:slide>
        <VectorPolygonSimple bind:layer />
      </div>
    {:else if layer.legendType === VectorLayerPolygonLegendTypes.ADVANCED}
      <div transition:slide>
        <VectorPolygonAdvanced bind:layer bind:layerMin bind:layerMax />
      </div>
    {/if}
  </div>
  <div class="columm legend-toggle" transition:slide>
    {#if layerNumberProperties > 0}
      <Wrapper>
        <div class="toggle-container" on:click={handleLegendToggleClick} data-testid="legend-toggle-container">
          <Card>
            <PrimaryAction style="padding: 10px;">
              <Fa icon={faRetweet} style="font-size: 16px;" spin={isLegendSwitchAnimate} />
            </PrimaryAction>
          </Card>
        </div>
        <Tooltip showDelay={500} hideDelay={0} yPos="above">Toggle Legend Type</Tooltip>
      </Wrapper>
      <br />
    {/if}

    {#if layer.legendType === VectorLayerPolygonLegendTypes.ADVANCED}
      <div
        class="toggle-container"
        use:popperRef
        on:click={handleClosePopup}
        data-testid="colormap-toggle-container"
        transition:fade>
        <Card>
          <PrimaryAction style="padding: 10px;">
            <Fa icon={faPalette} style="font-size: 16px;" />
          </PrimaryAction>
        </Card>
      </div>
    {/if}

    {#if showTooltip && layer.legendType === VectorLayerPolygonLegendTypes.ADVANCED}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <ColorMapPicker
          on:handleColorMapClick={handleColorMapClick}
          on:handleClosePopup={handleClosePopup}
          {layer}
          {layerMin}
          {layerMax} />
        <div id="arrow" data-popper-arrow />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import '../../styles/popper.scss';

  .legend-toggle {
    padding-top: 15px;

    .toggle-container {
      margin-left: 3.5px;
    }
  }

  $tooltip-background: #fff;

  #tooltip {
    max-width: 470px;
    width: 470px;
  }
</style>
