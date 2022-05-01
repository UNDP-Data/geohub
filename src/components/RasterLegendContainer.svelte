<script lang="ts" context="module">
  const selectedLegend = {}
</script>

<script lang="ts">
  import { slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { createPopperActions } from 'svelte-popperjs'

  import ColorMapPicker from '$components/ColorMapPicker.svelte'
  import ContinuousLegend from '$components/ContinuousLegend.svelte'
  import IntervalsLegend from '$components/IntervalsLegend.svelte'
  import UniqueValuesLegend from '$components/UniqueValuesLegend.svelte'
  import { DynamicLayerLegendTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let activeColorMapName: string
  export let layer: Layer

  let isLegendSwitchAnimate = false
  let selectedLegendType = selectedLegend[layer.definition.id] || DynamicLayerLegendTypes.CONTINUOUS

  $: selectedLegendType, setSelectedLegend()

  const setSelectedLegend = () => {
    selectedLegend[layer.definition.id] = selectedLegendType
  }

  const handleLegendToggleClick = () => {
    isLegendSwitchAnimate = true

    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)

    selectedLegendType === DynamicLayerLegendTypes.INTERVALS
      ? (selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS)
      : (selectedLegendType = DynamicLayerLegendTypes.INTERVALS)
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
          offset: [20, 20],
        },
      },
    ],
  }
  let showTooltip = false

  import { fade } from 'svelte/transition'

  const handleColorMapClick = () => {
    showTooltip = !showTooltip
  }
</script>

<div class="columns" data-testid="raster-legend-view-container">
  <div class="column is-10">
    {#if selectedLegendType === DynamicLayerLegendTypes.CONTINUOUS}
      <div transition:slide>
        <ContinuousLegend bind:activeColorMapName layerConfig={layer} />
      </div>
    {:else if selectedLegendType === DynamicLayerLegendTypes.INTERVALS}
      <div transition:slide>
        <IntervalsLegend bind:activeColorMapName layerConfig={layer} />
      </div>
    {:else if selectedLegendType === DynamicLayerLegendTypes.UNIQUE}
      <div transition:slide>
        <UniqueValuesLegend bind:activeColorMapName layerConfig={layer} />
      </div>
    {/if}
  </div>
  <div class="columm legend-toggle" transition:slide>
    <Wrapper>
      <div class="toggle-container" on:click={handleLegendToggleClick} data-testid="legend-toggle-container">
        <Card>
          <PrimaryAction style="padding: 10px;">
            <Fa icon={faRetweet} style="font-size: 16px;" spin={isLegendSwitchAnimate} />
          </PrimaryAction>
        </Card>
      </div>
      <Tooltip showDelay={1000} hideDelay={0} yPos="above">Toggle Legend Type</Tooltip>
    </Wrapper>
    <br />

    <div class="toggle-container" use:popperRef on:click={handleColorMapClick} data-testid="colormap-toggle-container">
      <Card>
        <PrimaryAction style="padding: 10px;">
          <Fa icon={faPalette} style="font-size: 16px;" />
        </PrimaryAction>
      </Card>
    </div>

    {#if showTooltip}
      <div id="tooltip" data-testid="tooltip" use:popperContent={popperOptions} transition:fade>
        <ColorMapPicker on:handleColorMapClick={handleColorMapClick} {layer} />
        <div id="arrow" data-popper-arrow />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .legend-toggle {
    padding-top: 15px;

    .toggle-container {
      margin-left: 3.5px;
    }
  }

  $tooltip-background: #fff;

  #tooltip {
    background: $tooltip-background;
    border-radius: 7.5px;
    border: 1px solid #ccc;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    font-size: 13px;
    max-width: 480px;
    width: 480px;
    max-height: 300px;
    padding: 15px;
    padding-top: 10px;
    position: absolute;
    top: 10px;

    @media (prefers-color-scheme: dark) {
      background: #212125;
    }

    #arrow,
    #arrow::before {
      position: absolute;
      width: 18px;
      height: 18px;
      background: $tooltip-background;
      left: -4.5px;

      @media (prefers-color-scheme: dark) {
        background: #212125;
      }
    }

    #arrow {
      visibility: visible;
    }

    #arrow::before {
      visibility: visible;
      content: '';
      transform: rotate(45deg);
      border-bottom: 1px solid #ccc;
      border-left: 1px solid #ccc;
    }
  }
</style>
