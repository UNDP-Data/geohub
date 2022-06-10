<script lang="ts">
  import Button from '@smui/button'
  import Paper from '@smui/paper'

  export let showIntro: boolean
  const hideIntro = () => {
    showIntro = false
  }
</script>

{#if showIntro}
  <Paper>
    <p>
      Welcome to the UNDP GeoHub dashboard. This site serves as a simplified preview to familiarize users with data
      being prepared for the full-fledged GeoHub web app launching soon. Presented here is a High Resolution Electricity
      Access (HREA) created by the University of Michigan, used to support the 2030 Social Development Goal (SDG) number
      7: ensuring access to affordable, reliable, sustainable and modern energy for all.
    </p>
    <p>
      This map displays two types of electricity access layers, with an optional poverty heatmap which can be overlaid.
      Layer statistics can be explored by either hovering over the map, showing values for the layers underneath the
      mouse, or by drawing a circle, providing summaries of the values contained within.
    </p>
    <br />
    <Button variant="raised" on:click={hideIntro}>Explore Data</Button>
  </Paper>
{/if}

<style lang="scss">
  p {
    padding: 10px;
    border-radius: 5px;
  }
</style>
