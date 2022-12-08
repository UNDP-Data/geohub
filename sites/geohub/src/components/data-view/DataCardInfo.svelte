<script lang="ts">
  import { marked } from 'marked'
  import Time from 'svelte-time'
  import type { RasterTileMetadata, StacItemFeature, VectorTileMetadata } from '$lib/types'

  export let feature: StacItemFeature = undefined
  export let metadata: RasterTileMetadata | VectorTileMetadata = undefined

  let isFullDescription = false
  let descriptionLength = 100
</script>

<div class="container">
  {#if feature}
    <p class="title is-5 has-text-left">{feature.properties.name}</p>
    <slot />
    <div class="description has-text-justified">
      {#if !isFullDescription}
        {#if feature.properties.description.length < 100}
          {@html marked(feature.properties.description)}
        {:else}
          {feature.properties.description.substring(0, descriptionLength)}...
        {/if}
        <br />
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
          class="cta__link cta--arrow"
          on:click={() => {
            isFullDescription = true
          }}>
          READ MORE
          <i />
        </a>
      {:else}
        {#if feature.properties.description}
          <p><b>Description: </b>{@html marked(feature.properties.description)}</p>
        {/if}
        {#if metadata}
          {#if metadata['band_metadata']}
            {#if metadata['band_metadata'][0][1]?.RepresentationType}
              <p><b>Representation Type: </b> {metadata['band_metadata'][0][1].RepresentationType}</p>
            {/if}
            {#if metadata['band_metadata'][0][1]?.Unit}
              <p><b>unit: </b> {metadata['band_metadata'][0][1].Unit}</p>
            {/if}
            {#if metadata['band_metadata'][0][1]?.STATISTICS_MINIMUM}
              <p><b>Minimum value: </b> {metadata['band_metadata'][0][1].STATISTICS_MINIMUM}</p>
            {/if}
            {#if metadata['band_metadata'][0][1]?.STATISTICS_MAXIMUM}
              <p><b>Maximum value: </b> {metadata['band_metadata'][0][1].STATISTICS_MAXIMUM}</p>
            {/if}
            {#if metadata['band_metadata'][0][1]?.STATISTICS_MEAN}
              <p><b>Mean value: </b> {metadata['band_metadata'][0][1].STATISTICS_MEAN}</p>
            {/if}
            {#if metadata['band_metadata'][0][1]?.STATISTICS_MEDIAN}
              <p><b>Median value: </b> {metadata['band_metadata'][0][1].STATISTICS_MEDIAN}</p>
            {/if}
            {#if metadata['band_metadata'][0][1]?.STATISTICS_STDDEV}
              <p><b>STDDev value: </b> {metadata['band_metadata'][0][1].STATISTICS_STDDEV}</p>
            {/if}
            {#if metadata['band_metadata'][0][1]?.STATISTICS_VALID_PERCENT}
              <p><b>Valid percent: </b> {metadata['band_metadata'][0][1].STATISTICS_VALID_PERCENT}</p>
            {/if}
          {/if}
        {/if}
        <p><b>Source: </b> {feature.properties.source}</p>
        <p>
          <b>Updated at: </b>
          <Time
            timestamp={feature.properties.updatedat}
            format="h:mm A, MMMM D, YYYY" />
        </p>
      {/if}
    </div>
  {/if}
</div>

<style lang="scss">
  @use '../../styles/undp-design/base-minimal.min.css';
  @use '../../styles/undp-design/buttons.min.css';
  @use '../../styles/undp-design/cta-link.min.css';

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;

    .description {
      padding-bottom: 0.5rem;
    }
  }
</style>
