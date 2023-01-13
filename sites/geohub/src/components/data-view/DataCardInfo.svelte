<script lang="ts">
  import { marked } from 'marked'
  import Time from 'svelte-time'
  import type { RasterTileMetadata, StacItemFeature, VectorTileMetadata } from '$lib/types'
  import { CtaLink } from '@undp-data/svelte-undp-design'
  import { MAP_ATTRIBUTION } from '$lib/constants'

  export let feature: StacItemFeature = undefined
  export let metadata: RasterTileMetadata | VectorTileMetadata = undefined

  const is_raster: boolean = feature.properties.is_raster as unknown as boolean

  let attribution = MAP_ATTRIBUTION
  if (feature.properties.source) {
    attribution = feature.properties.source
  }
  $: if (metadata) {
    if (!is_raster) {
      const vectorInfo = metadata as VectorTileMetadata
      if (vectorInfo.attribution) {
        attribution = vectorInfo.attribution
      }
    }
  }

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
        <CtaLink
          label="READ MORE"
          on:clicked={() => {
            isFullDescription = true
          }} />
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
              <p><b>Units: </b> {metadata['band_metadata'][0][1].Unit}</p>
            {/if}
            <!-- {#if metadata['band_metadata'][0][1]?.STATISTICS_MINIMUM}
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
            {/if} -->
          {/if}
        {/if}
        <p><b>Source: </b> {@html attribution}</p>
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
  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;

    .description {
      padding-bottom: 0.5rem;
    }
  }
</style>
