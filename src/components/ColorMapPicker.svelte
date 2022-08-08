<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { clickOutside } from 'svelte-use-click-outside'

  import ColorMapPickerCard from '$components/ColorMapPickerCard.svelte'
  import { SequentialColormaps, DivergingColorMaps, QualitativeColorMaps } from '$lib/colormaps'
  import { ColorMapTypes } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import { updateParamsInURL } from '../lib/helper'

  export let activeColorMapType = ColorMapTypes.SEQUENTIAL
  export let layer: Layer
  export let layerMax: number
  export let layerMin: number
  let numberOfClasses = layer.intervals.numberOfClasses

  $: {
    if (layer) {
      numberOfClasses = layer.intervals.numberOfClasses
    }
  }

  const dispatch = createEventDispatcher()
  const colorMapTypes = [
    { name: ColorMapTypes.SEQUENTIAL, codes: SequentialColormaps },
    { name: ColorMapTypes.DIVERGING, codes: DivergingColorMaps },
    { name: ColorMapTypes.QUALITATIVE, codes: QualitativeColorMaps },
  ]

  const handleSetActiveColorMapType = (colorMapType: ColorMapTypes) => {
    activeColorMapType = colorMapType
  }

  const handleColorMapClick = (colorMapName: string) => {
    if (colorMapName !== layer.colorMapName) {
      dispatch('handleColorMapClick', { colorMapName })
      layer.colorMapName = colorMapName
    }
  }

  const handleClosePopup = () => {
    dispatch('handleClosePopup')
  }
</script>

<div data-testid="color-map-picker" use:clickOutside={handleClosePopup}>
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
    <div
      class="column is-1 close"
      alt="Close Colormap Picker"
      title="Close Colormap Picker"
      on:click={handleClosePopup}>
      <Fa icon={faXmark} />
    </div>
  </div>
  <div class="columns">
    <div class="column card-color">
      <ul class="is-size-6">
        {#each colorMapTypes as colorMapType}
          {#if activeColorMapType === colorMapType.name}
            {#each colorMapType.codes.sort((a, b) => a.localeCompare(b)) as colorMapName}
              <li on:click={() => handleColorMapClick(colorMapName)}>
                <ColorMapPickerCard
                  {colorMapName}
                  colorMapType={ColorMapTypes.SEQUENTIAL}
                  {layerMax}
                  {layerMin}
                  {numberOfClasses}
                  isSelected={layer.colorMapName === colorMapName} />
              </li>
            {/each}
          {/if}
        {/each}
      </ul>
    </div>
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

  .card-color {
    max-height: 150px;
    overflow-y: auto;

    ul {
      display: flex;
      flex-flow: row wrap;
      gap: 15px;

      li {
        cursor: pointer;
        padding: 1px;

        &:hover {
          padding: 0;
          border: 1px solid hsl(204, 86%, 53%);
        }
      }
    }
  }
</style>
