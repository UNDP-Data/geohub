<script lang="ts">
  import Fa from 'svelte-fa'
  import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
  import { clean } from '$lib/helper'

  export let iconImageAlt: string
  export let iconImageSrc = null
  export let legendSymbolContainer: HTMLElement
  export let isSelected = false
</script>

<div class="card" data-testid="icon-picker-card-container">
  <div class="card-content">
    <div class="media is-flex is-justify-content-center">
      <figure class={`image is-24x24 ${isSelected ? '' : 'is-clickable'}`} data-testid="icon-figure">
        {#if legendSymbolContainer}
          <div bind:this={legendSymbolContainer} />
        {:else}
          <input
            type="image"
            src={iconImageSrc}
            alt={clean(iconImageAlt)}
            title={clean(iconImageAlt)}
            style="width:24px; height:24px; color: white;"
            value={iconImageAlt} />
        {/if}
      </figure>
    </div>
    <div class="content is-size-7 columns is-gapless" style="padding-top: 5px;">
      <div class="column is-flex is-justify-content-center sprite-image-title" alt={iconImageAlt} title={iconImageAlt}>
        {clean(iconImageAlt)}
      </div>
      {#if isSelected}
        <div class="selected" alt="Icon Selected" title="Icon Selected">
          <Fa icon={faCheck} />
        </div>
      {/if}
    </div>
  </div>
</div>

<style lang="scss">
  .card {
    cursor: pointer;

    .card-content {
      padding: 5px;

      .media {
        margin: 0;
      }

      .sprite-image-title {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 75px;
        width: 75px;
      }

      .selected {
        color: hsl(141, 53%, 53%);
        position: absolute;
        right: 5px;
        top: 3px;
      }
    }
  }
</style>
