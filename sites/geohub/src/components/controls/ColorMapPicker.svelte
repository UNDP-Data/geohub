<script lang="ts">
  import { fade } from 'svelte/transition'
  import { createEventDispatcher } from 'svelte'
  import { clickOutside } from 'svelte-use-click-outside'

  import ColorMapPickerCard from '$components/controls/ColorMapPickerCard.svelte'
  import { SequentialColormaps, DivergingColorMaps, QualitativeColorMaps } from '$lib/colormaps'
  import { ColorMapTypes } from '$lib/constants'
  import type { Tab } from '@undp-data/svelte-undp-design/package/interfaces'
  import { Tabs } from '@undp-data/svelte-undp-design'
  import Popper from '$lib/popper'

  export let activeColorMapType = ColorMapTypes.SEQUENTIAL
  export let colorMapName: string

  const dispatch = createEventDispatcher()
  const colorMapTypes = [
    { name: ColorMapTypes.SEQUENTIAL, codes: SequentialColormaps },
    { name: ColorMapTypes.DIVERGING, codes: DivergingColorMaps },
    { name: ColorMapTypes.QUALITATIVE, codes: QualitativeColorMaps },
  ]

  let tabs: Tab[] = colorMapTypes.map((type) => {
    return { label: type.name }
  })

  let showTooltip = false

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'right-end',
      strategy: 'fixed',
    },
    [10, 15],
  ).init()

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
    showTooltip = !showTooltip
  }

  const handleEnterKey = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      event.target.click()
    }
  }
</script>

<div class="columm legend-toggle">
  <button
    class="colormap-button button icon has-tooltip-left has-tooltip-arrow"
    aria-label="Open Color Scheme Picker"
    data-tooltip="Change color map"
    tabindex="0"
    use:popperRef
    on:keydown={handleEnterKey}
    on:click={handleClosePopup}
    data-testid="colormap-toggle-container">
    <i
      class="fa-solid fa-palette fa-lg"
      style="color: white" />
  </button>

  {#if showTooltip}
    <div
      id="tooltip"
      data-testid="tooltip"
      use:popperContent={popperOptions}
      transition:fade>
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
                        isSelected={colorMapName === cmName} />
                    </li>
                  {/each}
                {/if}
              {/each}
            </ul>
          </div>
        </div>
      </div>

      <div
        id="arrow"
        data-popper-arrow />
    </div>
  {/if}
</div>

<style lang="scss">
  @import '../../styles/popper.scss';

  .legend-toggle {
    .colormap-button {
      background: #d12800;
      width: 32px;
      height: 32px;
      border-radius: 5px;
      cursor: pointer;
    }
  }

  #tooltip {
    max-height: 300px;
    max-width: 470px;
  }

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
