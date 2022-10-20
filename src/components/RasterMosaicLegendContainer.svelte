<script lang="ts">
  import { fade, slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'

  import Popper from '$lib/popper'
  import type { Layer } from '$lib/types'
  import ColorMapPicker from '$components/ColorMapPicker.svelte'
  import ContinuousLegend from '$components/ContinuousLegend.svelte'
  import { updateParamsInURL } from '$lib/helper'

  export let layer: Layer
  let colorPickerVisibleIndex: number
  let showTooltip = false

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

  const handleClosePopup = () => {
    showTooltip = !showTooltip
    colorPickerVisibleIndex = -1
  }

  const handleEnterKeyForColor = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleClosePopup()
    }
  }

  const handleColorMapClick = (event: CustomEvent) => {
    if (event?.detail?.colorMapName) {
      const colorMapName = event?.detail?.colorMapName
      const tiles = layer.source.tiles
      const layerURL = new URL(tiles[0])
      layerURL.searchParams.delete('colormap_name')
      layerURL.searchParams.delete('rescale')
      const rescale = [layer.continuous.minimum, layer.continuous.maximum]
      const updatedParams = Object.assign({ colormap_name: colorMapName, rescale: rescale.join(',') })
      updateParamsInURL(layer.definition, layerURL, updatedParams)
    }
  }
</script>

<div class="columns">
  <div class="column is-10">
    <div transition:slide>
      <ContinuousLegend bind:layerConfig={layer} />
    </div>
  </div>

  <div class="columm legend-toggle" transition:slide>
    <Wrapper>
      <div
        role="button"
        class="toggle-container"
        aria-label="Open Color Scheme Picker"
        use:popperRef
        on:click={handleClosePopup}
        data-testid="colormap-toggle-container">
        <Card on:keydown={handleEnterKeyForColor} style="background: #D12800;">
          <PrimaryAction style="padding: 10px;">
            <Fa icon={faPalette} style="font-size: 16px; color: white" />
          </PrimaryAction>
        </Card>
      </div>
      <Tooltip showDelay={1000} hideDelay={0} yPos="above">Change color map</Tooltip>
    </Wrapper>

    {#if showTooltip}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <ColorMapPicker
          on:handleColorMapClick={handleColorMapClick}
          on:handleClosePopup={handleClosePopup}
          {layer}
          layerMin={layer.continuous.minimum}
          layerMax={layer.continuous.maximum} />
        <div id="arrow" data-popper-arrow />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @import '../styles/popper.scss';

  .legend-toggle {
    padding-top: 15px;

    .toggle-container {
      margin-left: 3.5px;
    }
  }

  #tooltip {
    max-height: 300px;
    max-width: 470px;
  }
</style>
