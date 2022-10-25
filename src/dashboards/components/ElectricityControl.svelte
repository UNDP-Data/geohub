<script lang="ts">
  import SegmentedButton, { Segment, Label } from '@smui/segmented-button'
  import Fa from 'svelte-fa'
  import { faPlugCircleBolt } from '@fortawesome/free-solid-svg-icons/faPlugCircleBolt'
  import { faLaptopCode } from '@fortawesome/free-solid-svg-icons/faLaptopCode'
  import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
  import TimeSlider from './TimeSlider.svelte'
  import ElectricityLegend from './ElectricityLegend.svelte'

  let POVERTY_ID = 'poverty'
  const HREA_ID = 'HREA'
  const ML_ID = 'ML'
  const NONE_ID = 'NONE'

  let electricityChoices = [
    { name: HREA_ID, icon: faPlugCircleBolt, title: 'High Resolution Electricity Access' },
    { name: ML_ID, icon: faLaptopCode, title: 'Machine Learning' },
    { name: NONE_ID, icon: faBan, title: 'None' },
  ]
  export let electricitySelected = electricityChoices[0]

  export let loadRasterLayer = () => {
    return
  }
</script>

<div class="centered">
  <SegmentedButton
    segments={electricityChoices}
    let:segment
    singleSelect
    bind:selected={electricitySelected}>
    <Segment
      {segment}
      title={segment.title}>
      <div class="icon">
        <Fa
          icon={segment.icon}
          size="lg" />
      </div>
      <Label>{segment.name}</Label>
    </Segment>
  </SegmentedButton>
  <ElectricityLegend bind:electricitySelected />
</div>
<div class="raster-time-slider">
  <TimeSlider
    bind:electricitySelected
    bind:loadLayer={loadRasterLayer}
    bind:BEFORE_LAYER_ID={POVERTY_ID} />
</div>

<style lang="scss">
  .raster-time-slider {
    padding-top: 1em;
    padding-bottom: 1em;
  }

  .icon {
    padding-left: 10px;
    padding-right: 20px;
  }

  :global(.centered) {
    width: max-content;
    margin: auto !important;
  }
</style>
