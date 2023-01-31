<script lang="ts">
  import { RasterTileData } from '$lib/RasterTileData'
  import type {
    AssetOptions,
    RasterTileMetadata,
    StacItemFeature,
    StacItemFeatureCollection,
    VectorLayerTileStatLayer,
    VectorTileMetadata,
  } from '$lib/types'
  import { VectorTileData } from '$lib/VectorTileData'
  import { Accordion } from '@undp-data/svelte-undp-design'
  import MiniMap from '$components/data-view/MiniMap.svelte'
  import { map, layerList, indicatorProgress } from '$stores'
  import DataCardInfo from '$components/data-view/DataCardInfo.svelte'
  import AddLayerButton from '$components/data-view/AddLayerButton.svelte'
  import DataStacAssetCard from '$components/data-view/DataStacAssetCard.svelte'
  import DataVectorCard from '$components/data-view/DataVectorCard.svelte'
  import { onMount } from 'svelte'

  export let feature: StacItemFeature
  export let isExpanded: boolean

  let defaultColor: string = undefined
  let defaultColormap: string = undefined
  let clientWidth: number
  $: width = `${clientWidth * 0.95}px`

  let assetList: AssetOptions[] = []

  let metadata: RasterTileMetadata | VectorTileMetadata

  const is_raster: boolean = feature.properties.is_raster as unknown as boolean
  const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [{ key: string; value: string }]
  const stacType = tags?.find((tag) => tag.key === 'stac')

  let expanded: { [key: string]: boolean } = {}
  let expandedDatasetAssetId: string

  let tilestatsLayers: VectorLayerTileStatLayer[] = []

  let isGettingMetadata: Promise<void>
  const getMetadata = async () => {
    if (is_raster) {
      if (!stacType) {
        const rasterTile = new RasterTileData($map, feature)
        metadata = await rasterTile.getMetadata()
      }
    } else {
      const vectorTile = new VectorTileData($map, feature)
      const res = await vectorTile.getMetadata()
      metadata = res.metadata
      tilestatsLayers = res.metadata.json.tilestats.layers
    }
  }

  onMount(() => {
    isGettingMetadata = getMetadata()
  })

  $: {
    let expandedDatasets = Object.keys(expanded).filter(
      (key) => expanded[key] === true && key !== expandedDatasetAssetId,
    )
    if (expandedDatasets.length > 0) {
      expandedDatasetAssetId = expandedDatasets[0]
      Object.keys(expanded)
        .filter((key) => key !== expandedDatasetAssetId)
        .forEach((key) => {
          expanded[key] = false
        })
      expanded[expandedDatasets[0]] = true
    }
  }

  const addLayer = async () => {
    try {
      $indicatorProgress = true

      if (is_raster) {
        if (stacType) {
          // STAC
          return
        } else {
          // COG
          const rasterInfo = metadata as RasterTileMetadata
          const rasterTile = new RasterTileData($map, feature, rasterInfo)
          const data = await rasterTile.add(defaultColormap)

          $layerList = [
            {
              id: data.layer.id,
              name: feature.properties.name,
              info: data.metadata,
              dataset: feature,
            },
            ...$layerList,
          ]
        }
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
      const rootUrl = f.links.find((link) => link.rel === 'root').href
      const assets = f.assets
      const itemProperties = f.properties
      const collectionId = f.collection
      assetList = []
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
</script>

{#if tilestatsLayers.length === 1}
  <DataVectorCard
    bind:layer={tilestatsLayers[0]}
    bind:feature
    bind:isExpanded
    bind:defaultColor
    bind:metadata
    isShowInfo={true} />
{:else}
  <Accordion
    headerTitle={feature.properties.name}
    bind:isExpanded>
    <div slot="button">
      {#await isGettingMetadata then}
        {#if tilestatsLayers.length < 2}
          {#if !stacType && !isExpanded}
            <AddLayerButton
              title="Add layer"
              isIconButton={true}
              on:clicked={addLayer} />
          {/if}
        {/if}
      {/await}
    </div>
    <div
      slot="content"
      class="card-container px-1"
      bind:clientWidth>
      {#if !is_raster && tilestatsLayers.length > 1}
        <DataCardInfo
          bind:feature
          bind:metadata />

        {#each tilestatsLayers as layer}
          <DataVectorCard
            bind:layer
            bind:feature
            bind:isExpanded={expanded[`${feature.properties.id}-${layer.layer}`]}
            bind:defaultColor
            bind:metadata
            isShowInfo={false} />
        {/each}
      {:else}
        <DataCardInfo
          bind:feature
          bind:metadata>
          <div class="map">
            <MiniMap
              bind:feature
              bind:width
              height={'150px'}
              bind:isLoadMap={isExpanded}
              bind:metadata
              bind:defaultColor
              bind:defaultColormap />
          </div>
        </DataCardInfo>

        {#if !stacType}
          <AddLayerButton
            title="Add layer"
            on:clicked={addLayer} />
        {/if}

        {#if stacType && stacType.key === 'stac' && assetList}
          <!--show asset list-->
          {#each assetList as asset}
            <DataStacAssetCard
              bind:asset
              bind:feature
              bind:isExpanded={expanded[`${feature.properties.id}-${asset.assetName}`]} />
          {/each}
        {/if}
      {/if}
    </div>
  </Accordion>
{/if}

<style lang="scss">
  .card-container {
    display: flex;
    flex-direction: column;
    margin-bottom: 0.5rem;

    .map {
      padding-bottom: 0.5rem;
    }

    .vector-symbol-radios {
      padding-bottom: 0.5rem;
    }
  }

  .loader-container {
    width: max-content;
    margin: auto;
  }
</style>
