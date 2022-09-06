<script lang="ts">
  import Fa from 'svelte-fa'
  import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'

  import type { ColorMapTypes } from '$lib/constants'
  import { colorMapStyle } from '$lib/colormaps'

  export let colorMapName: string
  export let colorMapType: ColorMapTypes
  export let isCardStyle = true
  export let isSelected: boolean
  export let layerMax: number
  export let layerMin: number
  export let numberOfClasses: number

  let cardStyle: string

  $: {
    if (colorMapName || numberOfClasses) setCardStyle()
  }

  const setCardStyle = () => {
    cardStyle = colorMapStyle(colorMapType, colorMapName, layerMin, layerMax, numberOfClasses, isCardStyle)
  }
</script>

<div class="card" data-testid="color-map-picker-card-container" tabindex="0">
  <div class="card-content">
    <div class="media">
      <figure
        class={`image ${isCardStyle ? 'is-2by1' : ''} ${isSelected ? '' : 'is-clickable'}`}
        style={cardStyle}
        data-testid="color-map-figure" />
    </div>
    <div class="content is-size-7 columns is-gapless">
      <div class="column is-10">
        {colorMapName}
      </div>
      {#if isSelected}
        <div class="column is-size-8 selected" alt="Colormap Selected" title="Colormap Selected">
          <Fa icon={faCheck} />
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .card-content {
    padding: 5px;

    .media {
      margin: 0;
    }

    .selected {
      color: hsl(141, 53%, 53%);
      position: relative;
      right: 2px;
      top: 1.5px;
    }
  }
</style>
