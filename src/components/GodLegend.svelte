<script lang="ts">
  import Legend from '$components/Legend.svelte'
  import IntervalsLegend from '$components/IntervalsLegend.svelte'
  import { Wrapper } from '@smui/tooltip'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { DynamicLayerLegendTypes } from '$lib/constants'
  import Fa from 'svelte-fa'
  import UniqueValuesLegend from '$components/UniqueValuesLegend.svelte'

  export let activeColorMapName
  export let layer

  let isLegendSwitchAnimate
  let selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS.toString()
</script>

<div class="card-face card-face-back" id="legend-control" style="">
  <div style="width: 90%">
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
  <Wrapper>
    <div
      id="retweet-icon-div"
      on:click={() => {
        isLegendSwitchAnimate = true
        setTimeout(() => {
          isLegendSwitchAnimate = false
        }, 400)
        selectedLegendType === DynamicLayerLegendTypes.INTERVALS
          ? (selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS)
          : (selectedLegendType = DynamicLayerLegendTypes.INTERVALS)
      }}>
      <Fa style="border: 1px solid black" icon={faRetweet} size="2x" spin={isLegendSwitchAnimate} />
    </div>
  </Wrapper>
</div>

<style lang="scss">
  #legend-control {
    display: flex;
    padding: 0;
    border: 1px solid black;
  }
  #retweet-icon-div {
    cursor: pointer;
    width: 5%;
    margin-left: auto;
    padding-right: 15%;
    margin-top: 5%;
  }
</style>
