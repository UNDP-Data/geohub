<script lang="ts">
  import SegmentedButton, { Segment, Label } from '@smui/segmented-button'
  import Fa from 'svelte-fa'
  import { faPlugCircleBolt } from '@fortawesome/free-solid-svg-icons/faPlugCircleBolt'
  import { faLaptopCode } from '@fortawesome/free-solid-svg-icons/faLaptopCode'
  import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
  import TimeSlider from './TimeSlider.svelte'

  const AZURE_URL = import.meta.env.VITE_AZURE_URL

  let POVERTY_ID = 'poverty'
  const HREA_ID = 'HREA'
  const ML_ID = 'ML'
  const NONE_ID = 'NONE'

  export let getHreaUrl = (y: number): string => {
    return
  }
  export let getMlUrl = (y: number): string => {
    return
  }

  let electricityChoices = [
    { name: HREA_ID, icon: faPlugCircleBolt },
    { name: ML_ID, icon: faLaptopCode },
    { name: NONE_ID, icon: faBan },
  ]
  export let electricitySelected = electricityChoices[0]

  export let loadRasterLayer = () => {
    return
  }
</script>

<p class="title-text">Electricity Access</p>
<SegmentedButton segments={electricityChoices} let:segment singleSelect bind:selected={electricitySelected}>
  <Segment {segment}>
    <div class="icon">
      <Fa icon={segment.icon} size="lg" />
    </div>
    <Label>{segment.name}</Label>
  </Segment>
</SegmentedButton>
<div class="raster-time-slider">
  <TimeSlider
    bind:electricitySelected
    bind:loadLayer={loadRasterLayer}
    bind:BEFORE_LAYER_ID={POVERTY_ID}
    bind:getHreaUrl
    bind:getMlUrl
    {AZURE_URL} />
</div>

<style lang="scss">
  .title-text {
    font-size: 14px;
    color: rgb(1, 1, 1, 0.6);
    font-weight: normal;

    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }

  .raster-time-slider {
    padding-top: 1em;
    padding-bottom: 1em;
  }

  .icon {
    padding-left: 10px;
    padding-right: 20px;
  }
</style>
