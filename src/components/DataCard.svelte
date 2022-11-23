<script lang="ts">
  import type { StacItemFeature } from '$lib/types'
  import type { GeoJSONFeature } from 'maplibre-gl'
  import Accordion from './controls/Accordion.svelte'
  import MiniMap from './MiniMap.svelte'

  export let feature: StacItemFeature
  let isExpanded: boolean
  let descriptionLength = 100
  let isFullDescription = false
</script>

{#if feature}
  <Accordion
    headerTitle={feature.properties.name}
    bind:isExpanded>
    <div class="card-container px-1">
      <div class="map">
        <MiniMap
          bind:feature
          width={'100%'}
          height={'150px'}
          bind:isLoadMap={isExpanded} />
      </div>
      <div class="description">
        {#if !isFullDescription}
          <p class="has-text-justified">
            {#if feature.properties.description.length < 100}
              {feature.properties.description}
            {:else}
              {feature.properties.description.substring(0, descriptionLength)}...
            {/if}
          </p>
          <!-- svelte-ignore a11y-missing-attribute -->
          <a
            class="button button-primary button-without-arrow"
            role="button"
            on:click={() => {
              isFullDescription = true
            }}>
            Read more...
          </a>
        {:else}
          <p>{feature.properties.description}</p>
          <p>Source: {feature.properties.source}</p>
          <p>Updated at: {feature.properties.updatedat}</p>
        {/if}
      </div>

      <!-- svelte-ignore a11y-missing-attribute -->
      <a
        class="button button-primary button-without-arrow"
        role="button">
        Add layer
      </a>
    </div>
  </Accordion>
{/if}

<style lang="scss">
  @use '../styles/undp-design/base-minimal.min.css';
  @use '../styles/undp-design/buttons.min.css';
  .card-container {
    display: flex;
    flex-direction: column;

    .description {
      padding-bottom: 0.5rem;
    }

    .button {
      color: white !important;
    }

    .map {
      padding-bottom: 0.5rem;
      // display: flex;
      // flex-direction: column;
    }
  }
</style>
