<script lang="ts">
  import { fetchUrl } from '$lib/helper'
  import { map } from '../stores'

  let isContainerVisible = false
  let admin0_feature
  let admin1_feature

  $: {
    if ($map) {
      updateLocation()
      $map.on('moveend', mapMoveEnd)
    }
  }

  const mapMoveEnd = () => {
    updateLocation()
  }

  const updateLocation = () => {
    const center = $map.getCenter()
    fetchUrl(`/reverse.json?lng=${center.lng}&lat=${center.lat}`)
      .then((features) => {
        if (!features) return
        admin0_feature = features.find((f) => f.layer === 'admin_0')
        admin1_feature = features.find((f) => f.layer === 'admin_1')

        if (admin0_feature) {
          isContainerVisible = true
        } else {
          isContainerVisible = false
        }
      })
      .catch((err) => {
        admin0_feature = undefined
        admin1_feature = undefined
        isContainerVisible = false
      })
  }
</script>

{#if isContainerVisible}
  <div id="data-container" class="data-container target">
    <p>
      {#if admin0_feature}
        {admin0_feature.properties.NAME}
      {/if}
      {#if admin0_feature && admin1_feature}
        {'>>'} {admin1_feature.properties.name}
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
