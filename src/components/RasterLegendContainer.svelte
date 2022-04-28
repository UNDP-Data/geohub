<script lang="ts" context="module">
  const selectedLegend = {}
</script>

<script lang="ts">
  import { slide } from 'svelte/transition'
  import Card, { PrimaryAction } from '@smui/card'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'

  import IntervalsLegend from '$components/IntervalsLegend.svelte'
  import Legend from '$components/Legend.svelte'
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
</script>

<div class="columns" data-testid="raster-legend-view-container">
  <div class="column is-10">
    {#if selectedLegendType === DynamicLayerLegendTypes.CONTINUOUS}
      <div transition:slide>
        <Legend bind:activeColorMapName layerConfig={layer} />
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
  <div class="columm legend-toggle">
    <Wrapper>
      <div class="toggle-container" on:click={handleLegendToggleClick} data-testid="legend-toggle-container">
        <Card>
          <PrimaryAction style="padding: 10px;">
            <Fa icon={faRetweet} style="font-size: 16px;" spin={isLegendSwitchAnimate} />
          </PrimaryAction>
        </Card>
      </div>
      <Tooltip showDelay={500} hideDelay={100} yPos="above">Toggle Legend Type</Tooltip>
    </Wrapper>
  </div>
</div>

<style lang="scss">
  .legend-toggle {
    padding-top: 15px;

    .toggle-container {
      margin-left: 3.5px;
    }
  }
</style>
