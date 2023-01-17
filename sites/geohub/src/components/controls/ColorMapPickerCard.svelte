<script lang="ts">
  import type { ColorMapTypes } from '$lib/constants'
  import { colorMapStyle } from '$lib/colormaps'

  export let colorMapName: string
  export let colorMapType: ColorMapTypes
  export let isCardStyle = true
  export let isSelected: boolean

  let cardStyle: string

  $: {
    if (colorMapName) setCardStyle()
  }

  const setCardStyle = () => {
    cardStyle = colorMapStyle(colorMapType, colorMapName, isCardStyle)
  }
</script>

<div
  class="card"
  data-testid="color-map-picker-card-container"
  tabindex="0">
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
        <div
          class="column is-size-8 selected"
          alt="Colormap Selected"
          title="Colormap Selected">
          <i class="fas fa-check" />
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
