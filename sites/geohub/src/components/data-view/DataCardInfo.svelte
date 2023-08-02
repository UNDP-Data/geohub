<script lang="ts">
  import { marked } from 'marked'
  import Time from 'svelte-time'
  import type { RasterTileMetadata, DatasetFeature, VectorTileMetadata } from '$lib/types'
  import { CtaLink, Download } from '@undp-data/svelte-undp-design'
  import Star from './Star.svelte'

  import { createEventDispatcher } from 'svelte'
  import { createAttributionFromTags } from '$lib/helper'

  const dispatch = createEventDispatcher()

  export let feature: DatasetFeature = undefined
  export let metadata: RasterTileMetadata | VectorTileMetadata = undefined

  const is_raster: boolean = feature.properties.is_raster as unknown as boolean

  const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [{ key: string; value: string }]
  const stacType = tags?.find((tag) => tag.key === 'stac')

  const url = feature.properties.url

  const isStac = is_raster && stacType ? true : false
  const isPbf = !is_raster && url.toLocaleLowerCase().endsWith('.pbf')

  const unit = tags?.find((t) => t.key === 'unit')?.value

  let attribution = createAttributionFromTags(tags)
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

  interface FileOptions {
    title: string
    url: string
  }

  let file: FileOptions
  if (!(isStac === true || isPbf === true)) {
    const fileUrl = new URL(url.replace('pmtiles://', ''))
    const filePath = fileUrl.pathname.split('/')
    file = {
      title: filePath[filePath.length - 1],
      url: fileUrl.toString(),
    }
  }

  const handleStarDeleted = (e) => {
    dispatch('starDeleted', e.detail)
  }
</script>

<div class="container">
  {#if feature}
    <div class="card-title is-flex is-flex-direction-row is-align-content-center">
      <p class="title is-5 has-text-left">{feature.properties.name}</p>
    </div>
    <div class="star py-2">
      <Star
        bind:dataset_id={feature.properties.id}
        bind:isStar={feature.properties.is_star}
        on:starDeleted={handleStarDeleted} />
    </div>
    <slot />
    <div class="description has-text-justified">
      {#if !isFullDescription}
        {#if feature.properties.description.length < 100}
          <!-- eslint-disable svelte/no-at-html-tags -->
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
          <!-- eslint-disable svelte/no-at-html-tags -->
          <p><b>Description: </b>{@html marked(feature.properties.description)}</p>
        {/if}
        <p>
          <b>License: </b>{feature.properties.license?.length > 0
            ? feature.properties.license
            : 'License not specified'}
        </p>
        {#if metadata}
          {#if metadata['band_metadata']}
            {#if metadata['band_metadata'][0][1]?.RepresentationType}
              <p><b>Representation Type: </b> {metadata['band_metadata'][0][1].RepresentationType}</p>
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
        {#if unit}
          <p><b>Units: </b> {unit}</p>
        {/if}
        <!-- eslint-disable svelte/no-at-html-tags -->
        <p><b>Source: </b> {@html attribution}</p>
        <p>
          <b>Updated at: </b>
          <Time
            timestamp={feature.properties.updatedat}
            format="h:mm A, MMMM D, YYYY" />
        </p>
        <p>
          <b>Updated by: </b>
          {feature.properties.updated_user}
        </p>
        {#if file}
          <Download
            title={file.title}
            url={file.url} />
        {/if}
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
