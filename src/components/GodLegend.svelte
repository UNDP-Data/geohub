<script lang="ts">
  import Legend from './Legend.svelte'
  import IntervalsLegend from './IntervalsLegend.svelte'
  import { Wrapper } from '@smui/tooltip'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { DynamicLayerLegendTypes } from '../lib/constants'
  import Fa from 'svelte-fa'
  import UniqueValuesLegend from './UniqueValuesLegend.svelte'

  export let activeColorMapName
  export let layer

  let isLegendSwitchAnimate
  let selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS.toString()
</script>

<div class="card-face card-face-back">
  <div class="container">
    <div class="flip">
      <Wrapper>
        <div
          style="cursor: pointer; width: 20px;  margin-left: auto;"
          on:click={() => {
            isLegendSwitchAnimate = true
            setTimeout(() => {
              isLegendSwitchAnimate = false
            }, 400)

            selectedLegendType === DynamicLayerLegendTypes.INTERVALS
              ? (selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS)
              : (selectedLegendType = DynamicLayerLegendTypes.INTERVALS)
          }}>
          <Fa icon={faRetweet} size="1x" spin={isLegendSwitchAnimate} />
        </div>
      </Wrapper>
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
</div>

<style lang="scss">
</style>
