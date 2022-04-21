<script lang="ts">
  import Legend from '$components/Legend.svelte'
  import IntervalsLegend from '$components/IntervalsLegend.svelte'
  import { Wrapper } from '@smui/tooltip'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { DynamicLayerLegendTypes } from '$lib/constants'
  import Fa from 'svelte-fa'
  import UniqueValuesLegend from '$components/UniqueValuesLegend.svelte'
  import Button, { Label, Icon } from '@smui/button'

  export let activeColorMapName
  export let layer

  let isLegendSwitchAnimate
  let selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS.toString()
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
    <!--    <Fa icon={faRetweet} size="2x" spin={isLegendSwitchAnimate} />-->
    <Label>Switch legend</Label>
  </Button>
  <!--    <div-->
  <!--      class='switch-legend'-->
  <!--      id="retweet-icon-div"-->
  <!--      >-->
  <!--      <Fa style="border: 1px solid black" icon={faRetweet} size="2x" spin={isLegendSwitchAnimate} />-->
  <!--    </div>-->
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
  //#retweet-icon-div {
  //  cursor: pointer;
  //  width: 100%;
  //  justify-content: center;
  //}
  //
  //*:global(.switch-legend){
  //  height: 30px;
  //  width: 100%;
  //  background: red;
  //}
</style>
