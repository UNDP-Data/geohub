<script lang="ts">
  import { map } from '../stores'

  let isContainerVisible = false
  let adm0Name = null
  let adm1Name = null

  $: {
    if ($map) {
      $map.on('styledata', updateLocation)
      $map.on('move', updateLocation)
    }
  }

  const updateLocation = () => {
    if ($map.getLayer('admin')) {
      const point = $map.project($map.getCenter())
      const features = $map.queryRenderedFeatures(point, { layers: ['admin'] })
      if (features.length > 0) {
        adm0Name = features[0].properties.adm0_name
        adm1Name = features[0].properties.adm1_name
        isContainerVisible = Boolean(features[0].properties.adm0_name)
      } else isContainerVisible = false
    }
  }
</script>

{#if isContainerVisible}
  <div id="data-container" class="data-container target">
    <p>
      {#if adm0Name}
        {adm0Name}
      {/if}
      {#if adm1Name}
        {'>'} {adm1Name}
      {/if}
    </p>
  </div>
{/if}

<style lang="scss">
  .data-container {
    background-color: #fff;
    border-radius: 10px;
    border: 1px solid #ccc;
    top: 10px;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    font-family: ProximaNova, sans-serif;
    font-size: 11px;
    left: 10px;
    padding: 10px;
    position: absolute;
  }
</style>
