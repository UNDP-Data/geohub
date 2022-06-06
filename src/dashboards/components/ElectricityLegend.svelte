<script lang="ts">
  import chroma from 'chroma-js'
  const hreaLegend = chroma.scale('RdYlBu').colors().reverse()
  export let electricitySelected
</script>

{#if electricitySelected.name !== 'NONE'}
  <div class="legend" style="background: linear-gradient(to right, {[...hreaLegend]});" />
  <div style="display: flex; align-items: center; justify-content: space-between"><span>0%</span><span>100%</span></div>
{/if}

<style lang="scss">
  .legend {
    height: 20px;
    width: 100%;
    margin-top: 5%;
  }
</style>
