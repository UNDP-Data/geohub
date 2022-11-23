<script lang="ts">
  import { RasterTileData } from '$lib/RasterTileData'
  import type { StacItemFeature } from '$lib/types'
  import { VectorTileData } from '$lib/VectorTileData'
  import type { GeoJSONFeature } from 'maplibre-gl'
  import Accordion from './controls/Accordion.svelte'
  import MiniMap from './MiniMap.svelte'
  import { map, layerList } from '$stores'

  export let feature: StacItemFeature
  let isExpanded: boolean
  let descriptionLength = 100
  let isFullDescription = false

  const addLayer = async () => {
    const is_raster: boolean = feature.properties.is_raster as unknown as boolean
    const url: string = feature.properties.url
    const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
      { key: string; value: string },
    ]
    if (is_raster) {
      const type = tags?.find((tag) => tag.key === 'stac')
      if (type) {
        // STAC
      } else {
        // COG
        const rasterTile = new RasterTileData($map, feature)
        const data = await rasterTile.add()

        $layerList = [
          {
            id: data.layer.id,
            name: feature.properties.name,
            info: data.metadata,
          },
          ...$layerList,
        ]
      }
    } else {
      // vector tile
      const vectorTile = new VectorTileData($map, feature)
      const data = await vectorTile.add()

      $layerList = [
        {
          id: data.layer.id,
          name: feature.properties.name,
          info: data.metadata,
        },
        ...$layerList,
      ]
    }
  }
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
        {:else}
          <p><b>Description: </b>{feature.properties.description}</p>
          <p><b>Source: </b> {feature.properties.source}</p>
          <p><b>Updated at: </b> {feature.properties.updatedat}</p>
        {/if}
      </div>

      <div class="buttons">
        {#if !isFullDescription}
          <!-- svelte-ignore a11y-missing-attribute -->
          <a
            class="button button-primary button-without-arrow"
            style="width: 49%"
            role="button"
            on:click={() => {
              isFullDescription = true
            }}>
            Read more...
          </a>
        {/if}
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
          class="button button-primary button-without-arrow"
          style="width: {`${isFullDescription ? '100%' : '49%'}`}"
          role="button"
          on:click={addLayer}>
          Add layer
        </a>
      </div>
    </div>
  </Accordion>
{/if}

<style lang="scss">
  @use '../styles/undp-design/base-minimal.min.css';
  @use '../styles/undp-design/buttons.min.css';
  .card-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;

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
