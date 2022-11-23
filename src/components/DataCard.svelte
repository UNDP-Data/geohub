<script lang="ts">
  import { RasterTileData } from '$lib/RasterTileData'
  import type { StacAsset, StacItemFeature, StacItemFeatureCollection } from '$lib/types'
  import { VectorTileData } from '$lib/VectorTileData'
  import type { GeoJSONFeature } from 'maplibre-gl'
  import Accordion from './controls/Accordion.svelte'
  import MiniMap from './MiniMap.svelte'
  import { map, layerList, indicatorProgress } from '$stores'
  import { e } from 'mathjs'

  interface AssetDefinition {
    url: string
    assetName: string
    asset: StacAsset
  }

  export let feature: StacItemFeature
  let isExpanded: boolean
  let descriptionLength = 100
  let isFullDescription = false

  let assetList: AssetDefinition[] = []

  const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [{ key: string; value: string }]
  const stacType = tags?.find((tag) => tag.key === 'stac')

  const addLayer = async () => {
    try {
      $indicatorProgress = true

      const is_raster: boolean = feature.properties.is_raster as unknown as boolean
      const url: string = feature.properties.url

      if (is_raster) {
        if (stacType) {
          // STAC
          return
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
    } finally {
      $indicatorProgress = false
    }
  }

  $: isExpanded, getStacAssetList()

  const getStacAssetList = async () => {
    if (!isExpanded) return

    try {
      $indicatorProgress = true

      const LIMIT = 50
      const url: string = feature.properties.url
      const res = await fetch(`${url}?limit=1`)
      const fc: StacItemFeatureCollection = await res.json()
      const f = fc.features[0]
      const rootUrl = fc.links.find((link) => link.rel === 'root').href
      const assets = f.assets
      const itemProperties = f.properties
      Object.keys(assets).forEach((assetName) => {
        const asset = assets[assetName]
        if (asset.type !== 'image/tiff; application=geotiff; profile=cloud-optimized') return
        // generate URL for search API except bbox parameter
        // bbox needs to be specified from frontend based on the current viewing.
        // this search URL does not work, it needs to be converted to POST version from query params specified by frontend.
        let searchUrl = `${rootUrl}search?collections=${f.id}&sortby=${'datetime'}&limit=${LIMIT}`
        if (itemProperties['eo:cloud_cover']) {
          searchUrl = `${searchUrl}&filter=${JSON.stringify({ op: '<=', args: [{ property: 'eo:cloud_cover' }, 5] })}`
        }

        assetList = [
          ...assetList,
          {
            url: searchUrl,
            assetName: asset.title ?? assetName,
            asset: asset,
          },
        ]
      })
    } finally {
      $indicatorProgress = false
    }
  }

  const addStacMosaicLayer = async (url: string, asset: StacAsset) => {
    console.log(url, asset)
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
            role="button"
            on:click={() => {
              isFullDescription = true
            }}>
            Read more...
          </a>
        {/if}
        {#if !stacType}
          <!-- svelte-ignore a11y-missing-attribute -->
          <a
            class="button button-primary button-without-arrow"
            role="button"
            on:click={addLayer}>
            Add layer
          </a>
        {/if}
      </div>

      {#if stacType && assetList}
        <!--show asset list-->
        {#each assetList as asset}
          <Accordion headerTitle={asset.assetName}>
            <div class="container pb-2">
              <!-- svelte-ignore a11y-missing-attribute -->
              <a
                class="button button-primary button-without-arrow"
                role="button"
                style="width:100%"
                on:click={() => {
                  addStacMosaicLayer(asset.url, asset.asset)
                }}>
                Add layer
              </a>
            </div>
          </Accordion>
        {/each}
      {/if}
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

    .buttons {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-gap: 0.1rem;
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
