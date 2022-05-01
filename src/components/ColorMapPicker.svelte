<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'

  import ColorMapPickerCard from '$components/ColorMapPickerCard.svelte'
  import { sequentialColormaps, divergingColorMaps, qualitativeColorMaps } from '$lib/colormaps'
  import { ColorMapTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let activeColorMapType = ColorMapTypes.SEQUENTIAL
  export let layer: Layer

  const dispatch = createEventDispatcher()
  const layerMax = Number(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  const layerMin = Number(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM'])

  const handleSetActiveColorMapType = (colorMapType: ColorMapTypes) => {
    activeColorMapType = colorMapType
  }

  const handleColorMapClick = () => {
    dispatch('handleColorMapClick')
  }
</script>

<div class="columns is-vcentered is-mobile">
  <div class="column is-11">
    <div class="tabs">
      <ul>
        {#each Object.values(ColorMapTypes) as colorMapType}
          <li class={activeColorMapType === colorMapType ? 'is-active' : ''}>
            <a href={'#'} on:click={() => handleSetActiveColorMapType(colorMapType)}>
              {colorMapType}
            </a>
          </li>
        {/each}
      </ul>
    </div>
  </div>
  <div class="column is-1 close">
    <div on:click={handleColorMapClick}>
      <Fa icon={faXmark} />
    </div>
  </div>
</div>
<div class="columns">
  <div class="column card">
    <ul class="is-size-6">
      {#if activeColorMapType === ColorMapTypes.SEQUENTIAL}
        {#each sequentialColormaps.sort((a, b) => a.localeCompare(b)) as colorMapName}
          <li on:click={handleColorMapClick}>
            <ColorMapPickerCard
              {colorMapName}
              colorMapType={ColorMapTypes.SEQUENTIAL}
              {layerMax}
              {layerMin}
              numberOfColors={5} />
          </li>
        {/each}
      {:else if activeColorMapType === ColorMapTypes.DIVERGING}
        {#each divergingColorMaps.sort((a, b) => a.localeCompare(b)) as colorMapName}
          <li on:click={handleColorMapClick}>
            <ColorMapPickerCard
              {colorMapName}
              colorMapType={ColorMapTypes.DIVERGING}
              {layerMax}
              {layerMin}
              numberOfColors={5} />
          </li>
        {/each}
      {:else if activeColorMapType === ColorMapTypes.QUALITATIVE}
        {#each qualitativeColorMaps.sort((a, b) => a.localeCompare(b)) as colorMapName}
          <li on:click={handleColorMapClick}>
            <ColorMapPickerCard
              {colorMapName}
              colorMapType={ColorMapTypes.QUALITATIVE}
              {layerMax}
              {layerMin}
              numberOfColors={5} />
          </li>
        {/each}
      {/if}
    </ul>
  </div>
</div>

<style lang="scss">
  .tabs {
    li {
      a {
        text-transform: capitalize;
      }
    }
  }
  .close {
    cursor: pointer;
  }

  .card {
    max-height: 165px;
    overflow-y: auto;

    ul {
      flex-flow: row wrap;
      display: flex;
      gap: 15px;
    }
  }
</style>
