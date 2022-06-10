<script lang="ts">
  // imports
  import chroma from 'chroma-js'

  // const vars
  const povertyLegend = chroma.scale('RdYlBu').colors().reverse()
</script>

<div class="legend" style="background: linear-gradient(to right, {[...povertyLegend]});" />
<div style="display: flex; align-items: center; justify-content: space-between"><span>0%</span><span>100%</span></div>

<style lang="scss">
  .legend {
    height: 20px;
    width: 100%;
    margin-top: 5%;
  }
</style>
