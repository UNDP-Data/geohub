<script lang="ts">
  import { RasterTileData } from '$lib/RasterTileData'
  import type { BannerMessage, StacAsset, StacItemFeature, StacItemFeatureCollection } from '$lib/types'
  import { VectorTileData } from '$lib/VectorTileData'
  import type { GeoJSONFeature } from 'maplibre-gl'
  import Accordion from './controls/Accordion.svelte'
  import MiniMap from './MiniMap.svelte'
  import { map, layerList, indicatorProgress, bannerMessages } from '$stores'
  import { e } from 'mathjs'
  import { MosaicJsonData } from '$lib/MosaicJsonData'
  import { StatusTypes } from '$lib/constants'
  import { assets } from '$app/paths'

  interface AssetOptions {
    url: string
    assetName: string
    title: string
    asset: StacAsset
    collectionId: string
  }

  export let feature: StacItemFeature
  let isExpanded: boolean
  let descriptionLength = 100
  let isFullDescription = false

  let assetList: AssetOptions[] = []

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
    if (!stacType) return
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
      const collectionId = f.collection
      Object.keys(assets).forEach((assetName) => {
        const asset = assets[assetName]
        if (asset.type !== 'image/tiff; application=geotiff; profile=cloud-optimized') return
        // generate URL for search API except bbox parameter
        // bbox needs to be specified from frontend based on the current viewing.
        // this search URL does not work, it needs to be converted to POST version from query params specified by frontend.
        let searchUrl = `${rootUrl}search?collections=${collectionId}&sortby=${'datetime'}&limit=${LIMIT}`
        if (itemProperties['eo:cloud_cover']) {
          searchUrl = `${searchUrl}&filter=${JSON.stringify({ op: '<=', args: [{ property: 'eo:cloud_cover' }, 5] })}`
        }

        assetList = [
          ...assetList,
          {
            url: searchUrl,
            assetName: assetName,
            title: `${asset.title ?? assetName}`,
            asset: asset,
            collectionId: collectionId,
          },
        ]
      })
    } finally {
      $indicatorProgress = false
    }
  }

  const addStacMosaicLayer = async (asset: AssetOptions) => {
    try {
      $indicatorProgress = true
      const mosaicjson = new MosaicJsonData($map, feature, asset.url, asset.assetName)
      const data = await mosaicjson.add()

      $layerList = [
        {
          id: data.layer.id,
          name: `${asset.collectionId}-${asset.title}`,
          info: data.metadata,
        },
        ...$layerList,
      ]
    } catch (err) {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.WARNING,
        title: 'Whoops! Something went wrong.',
        message: err.message,
        error: err,
      }
      bannerMessages.update((data) => [...data, bannerErrorMessage])
      console.error(err)
    } finally {
      $indicatorProgress = false
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

      {#if stacType && stacType.key === 'stac' && assetList}
        <!--show asset list-->
        {#each assetList as asset}
          <Accordion headerTitle={asset.title}>
            <div class="container pb-2">
              <div class="description">
                {#if asset.asset.description}
                  <p><b>Description: </b>{asset.asset.description}</p>
                {/if}
                <p><b>Type: </b>{asset.asset.type}</p>
                {#if asset.asset['raster:bands'] && asset.asset['raster:bands'].length > 0}
                  {#if asset.asset['raster:bands'][0].name}
                    <p><b>Band name: </b>{asset.asset['raster:bands'][0].name}</p>
                  {/if}
                  {#if asset.asset['raster:bands'][0].description}
                    <p><b>Band description: </b>{asset.asset['raster:bands'][0].description}</p>
                  {/if}
                  {#if asset.asset['raster:bands'][0].sampling}
                    <p><b>Sampling: </b>{asset.asset['raster:bands'][0].sampling}</p>
                  {/if}
                  {#if asset.asset['raster:bands'][0].spatial_resolution}
                    <p><b>Spatial resolution: </b>{asset.asset['raster:bands'][0].spatial_resolution}</p>
                  {/if}
                {/if}
              </div>

              <!-- svelte-ignore a11y-missing-attribute -->
              <a
                class="button button-primary button-without-arrow"
                role="button"
                style="width:100%"
                on:click={() => {
                  addStacMosaicLayer(asset)
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
