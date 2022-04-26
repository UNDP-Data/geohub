<script lang="ts" context="module">
  const selectedLegend = {}
</script>

<script lang="ts">
  import Legend from '$components/Legend.svelte'
  import IntervalsLegend from '$components/IntervalsLegend.svelte'
  import { DynamicLayerLegendTypes } from '$lib/constants'
  import UniqueValuesLegend from '$components/UniqueValuesLegend.svelte'
  import Button, { Label } from '@smui/button'

  export let activeColorMapName
  export let layer
  let isLegendSwitchAnimate

  let selectedLegendType = selectedLegend[layer.definition.id] || DynamicLayerLegendTypes.CONTINUOUS
  const setSelectedLegend = () => {
    selectedLegend[layer.definition.id] = selectedLegendType
  }
  $: selectedLegendType, setSelectedLegend()
</script>

<div class="card-face card-face-back" id="legend-control" style="">
  <Button
    variant="unelevated"
    class="switch-legend-button"
    on:click={() => {
      isLegendSwitchAnimate = true
      setTimeout(() => {
        isLegendSwitchAnimate = false
      }, 400)
      selectedLegendType === DynamicLayerLegendTypes.INTERVALS
        ? (selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS)
        : (selectedLegendType = DynamicLayerLegendTypes.INTERVALS)
    }}>
    <Label>Switch legend</Label>
  </Button>

  <div style="width: 100%">
    {#if selectedLegendType === DynamicLayerLegendTypes.CONTINUOUS}
      <div>
        <Legend bind:activeColorMapName layerConfig={layer} />
      </div>
    {:else if selectedLegendType === DynamicLayerLegendTypes.INTERVALS}
      <div>
        <IntervalsLegend bind:activeColorMapName layerConfig={layer} />
      </div>
    {:else if selectedLegendType === DynamicLayerLegendTypes.UNIQUE}
      <UniqueValuesLegend bind:activeColorMapName layerConfig={layer} />
    {/if}
  </div>
</div>

<style lang="scss">
  #legend-control {
    display: block;

    width: 100%;
  }

  :global(.switch-legend-button) {
    padding: 0;
    width: 50%;
    height: 20px;
    text-transform: none;
    margin-left: 25%;
    border: 1px solid dodgerblue;
  }

  //}
</style>
