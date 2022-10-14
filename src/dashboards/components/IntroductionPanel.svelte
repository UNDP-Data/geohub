<script lang="ts">
  import Paper from '@smui/paper'

  export let showIntro: boolean
  const hideIntro = () => {
    showIntro = false
  }
</script>

{#if showIntro}
  <Paper>
    <p tabindex="0" role="article">
      Welcome to the UNDP GeoHub dashboard. Presented here are two raster layers that display the likelihood of full
      electrification for a given area: <a href="https://planetarycomputer.microsoft.com/dataset/hrea"
        >High Resolution Electricity Access (HREA)</a> and Machine Learning (ML). These are created by the University of
      Michigan, used to support the 2030 Social Development Goal (SDG) 7: ensuring access to affordable, reliable, sustainable
      and modern energy for all.
    </p>
    <p tabindex="0" role="article">
      Two layers can be overlaid on top of the raw data: a summary of HREA electrification by administrative areas, and
      a heatmap of poverty. Admin data is sourced from a dataset containing OCHA's <a href="https://fieldmaps.io/data"
        >Common Operational Datasets (CODs)</a
      >, using a custom population raster to calculate the percentage of population with electricity access in each
      area. Poverty data is sourced from Meta's
      <a href="https://dataforgood.facebook.com/dfg/tools/relative-wealth-index">Relative Wealth Index (RWI)</a>,
      showing areas with poverty relative to each country's own average wealth.
    </p>
    <p tabindex="0" role="article">
      Layer statistics can be explored in two ways: by hovering over the map, or by clicking anywhere. Hovering displays
      population percentages with full electrification over time. Clicking displays the likelihood of full
      electrification for a single pixel only.
    </p>
    <br />
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a style="border-radius: 0px" class="button button-primary" role="button" href="#" on:click={hideIntro}>
      Explore Data
    </a>
  </Paper>
{/if}

<style lang="scss">
  @import '../src/styles/undp-design/buttons.min';
  @import '../src/styles/undp-design/base-minimal.min';
  p {
    padding: 10px;
    border-radius: 5px;
  }
</style>
