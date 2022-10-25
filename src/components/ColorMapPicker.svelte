<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Fa from 'svelte-fa'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { clickOutside } from 'svelte-use-click-outside'

  import ColorMapPickerCard from '$components/ColorMapPickerCard.svelte'
  import { SequentialColormaps, DivergingColorMaps, QualitativeColorMaps } from '$lib/colormaps'
  import { ColorMapTypes, COLOR_CLASS_COUNT } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let activeColorMapType = ColorMapTypes.SEQUENTIAL
  export let layer: Layer
  export let layerMax: number
  export let layerMin: number
  let numberOfClasses = layer.intervals?.numberOfClasses || COLOR_CLASS_COUNT

  $: {
    if (layer) {
      numberOfClasses = layer.intervals?.numberOfClasses || COLOR_CLASS_COUNT
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

  const handleEnterKey = (event: any) => {
    if (event.key === 'Enter') {
      event.target.click()
    }
  }

  const handleArrowKey = (event: any) => {
    if (event.key === 'ArrowLeft') {
      setLeftActiveTab(activeColorMapType)
    }
    if (event.key === 'ArrowRight') {
      setRightActiveTab(activeColorMapType)
    }
  }

  const setLeftActiveTab = (currentActiveTab: string) => {
    const currentTabIndex = colorMapTypes.findIndex((tab) => tab.name === currentActiveTab)
    const nextTabIndex = currentTabIndex - 1
    if (nextTabIndex < 0) {
      activeColorMapType = colorMapTypes[colorMapTypes.length - 1].name
      document.getElementById(`${activeColorMapType}-${layer.definition.id}`)?.focus()
    } else {
      activeColorMapType = colorMapTypes[nextTabIndex].name
      document.getElementById(`${activeColorMapType}-${layer.definition.id}`)?.focus()
    }
  }

  const setRightActiveTab = (currentActiveTab: string) => {
    const currentTabIndex = colorMapTypes.findIndex((tab) => tab.name === currentActiveTab)
    const nextTabIndex = currentTabIndex + 1
    const nextTab = colorMapTypes[nextTabIndex]
    if (nextTab) {
      activeColorMapType = nextTab.name
      document.getElementById(`${activeColorMapType}-${layer.definition.id}`)?.focus()
    } else {
      activeColorMapType = colorMapTypes[0].name
      document.getElementById(`${activeColorMapType}-${layer.definition.id}`)?.focus()
    }
  }
</script>

<div
  data-testid="color-map-picker"
  use:clickOutside={handleClosePopup}>
  <div class="columns is-vcentered is-mobile">
    <div class="column is-11">
      <div class="tabs">
        <ul
          data-deep-link="true"
          data-tabs="true"
          id="tablist_1"
          role="tablist">
          {#each Object.values(ColorMapTypes) as colorMapType}
            <li class={activeColorMapType === colorMapType ? 'is-active tabs-title' : 'tabs-title'}>
              <a
                style="border: none"
                role="tab"
                id={`${colorMapType}-${layer.definition.id}`}
                href={'#'}
                on:click={() => handleSetActiveColorMapType(colorMapType)}
                on:keydown={handleArrowKey}>
                {colorMapType}
              </a>
            </li>
          {/each}
        </ul>
      </div>
    </div>
    <div
      tabindex="0"
      class="column is-1 close"
      alt="Close Colormap Picker"
      title="Close Colormap Picker"
      on:click={handleClosePopup}
      on:keydown={handleEnterKey}>
      <Fa icon={faXmark} />
    </div>
  </div>
  <div class="columns">
    <div class="column card-color">
      <ul class="is-size-6">
        {#each colorMapTypes as colorMapType}
          {#if activeColorMapType === colorMapType.name}
            {#each colorMapType.codes.sort((a, b) => a.localeCompare(b)) as colorMapName}
              <li
                on:click={() => handleColorMapClick(colorMapName)}
                on:keydown={handleEnterKey}>
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
  @import 'src/styles/undp-design/base-minimal.min';
  @import 'src/styles/undp-design/tab.min';
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
