<script lang="ts">
  import { DynamicLayerLegendTypes } from '../../lib/constants'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'

  let isLegendSwitchAnimate
  let selectedLegendType

  export let currentLegendType

  const setLegendType = () => {
    isLegendSwitchAnimate = true
    setTimeout(() => {
      isLegendSwitchAnimate = false
    }, 400)
    if (currentLegendType === DynamicLayerLegendTypes.CONTINUOUS) {
      currentLegendType = DynamicLayerLegendTypes.INTERVALS
      console.log('Continous')
    }
    if (currentLegendType === DynamicLayerLegendTypes.INTERVALS) {
      // switch to continous
      currentLegendType = DynamicLayerLegendTypes.CONTINUOUS
    }
    if (currentLegendType === DynamicLayerLegendTypes.UNIQUE) {
      console.log('Unique')
    }
  }
</script>

<Wrapper>
  <div style="cursor: pointer; width: 80%; height: 100%;" on:click={setLegendType}>
    <Fa icon={faRetweet} size="3.5x" spin={isLegendSwitchAnimate} />
  </div>
</Wrapper>

<style lang="scss">
</style>
