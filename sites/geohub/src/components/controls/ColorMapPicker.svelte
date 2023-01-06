<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { clickOutside } from 'svelte-use-click-outside'

  import ColorMapPickerCard from '$components/controls/ColorMapPickerCard.svelte'
  import { SequentialColormaps, DivergingColorMaps, QualitativeColorMaps } from '$lib/colormaps'
  import { ColorMapTypes } from '$lib/constants'
  import type { Tab } from '@undp-data/svelte-undp-design/interfaces'
  import { Tabs } from '@undp-data/svelte-undp-design'

  export let activeColorMapType = ColorMapTypes.SEQUENTIAL
  export let colorMapName: string
  export let numberOfClasses: number

  const dispatch = createEventDispatcher()
  const colorMapTypes = [
    { name: ColorMapTypes.SEQUENTIAL, codes: SequentialColormaps },
    { name: ColorMapTypes.DIVERGING, codes: DivergingColorMaps },
    { name: ColorMapTypes.QUALITATIVE, codes: QualitativeColorMaps },
  ]

  let tabs: Tab[] = colorMapTypes.map((type) => {
    return { label: type.name }
  })

  const handleColorMapClick = (cmName: string) => {
    //the lines below if removed will break  all the components that use this component and bind
    // two ways the colormap
    // i recommend using the evend instead and bind the colormap one way only
    if (cmName !== colorMapName) {
      colorMapName = cmName
    }

    dispatch('colorMapChanged', { colorMapName: cmName })
  }

  const handleClosePopup = () => {
    dispatch('handleClosePopup')
  }

  const handleEnterKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.target.click()
    }
  }
</script>

<div
  data-testid="color-map-picker"
  use:clickOutside={handleClosePopup}>
  <div class="columns is-vcentered is-mobile">
    <div class="column is-11">
      <Tabs
        bind:tabs
        bind:activeTab={activeColorMapType} />
    </div>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div
      tabindex="0"
      class="column is-1 close"
      alt="Close Colormap Picker"
      title="Close Colormap Picker"
      on:click={handleClosePopup}
      on:keydown={handleEnterKey}>
      <i class="fa-solid fa-xmark" />
    </div>
  </div>
  <div class="columns">
    <div class="column card-color">
      <ul class="is-size-6">
        {#each colorMapTypes as colorMapType}
          {#if activeColorMapType === colorMapType.name}
            {#each colorMapType.codes.sort((a, b) => a.localeCompare(b)) as cmName}
              <li
                on:click={() => handleColorMapClick(cmName)}
                on:keydown={handleEnterKey}>
                <ColorMapPickerCard
                  colorMapName={cmName}
                  colorMapType={ColorMapTypes.SEQUENTIAL}
                  {numberOfClasses}
                  isSelected={colorMapName === cmName} />
              </li>
            {/each}
          {/if}
        {/each}
      </ul>
    </div>
  </div>
</div>

<style lang="scss">
  .close {
    cursor: pointer;
  }

  .card-color {
    max-height: 200px;
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
