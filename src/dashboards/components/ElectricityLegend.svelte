<script lang="ts">
  // imports
  import chroma from 'chroma-js'

  // export vars
  export let electricitySelected: boolean

  // const vars
  const hreaLegend = chroma.scale('RdYlBu').colors().reverse()
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
