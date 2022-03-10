<script lang="ts">
  import Slider from '@smui/slider'
  export let layerOpacity = 1
</script>

<div>
  <Slider bind:value={layerOpacity} min={0} max={1} step={0.01} input$aria-label="Layer opacity" />
  <span> {layerOpacity}</span>
</div>
