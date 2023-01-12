<script lang="ts">
  import { RasterTileData } from '$lib/RasterTileData'
  import type {
    AssetOptions,
    RasterTileMetadata,
    StacItemFeature,
    StacItemFeatureCollection,
    VectorTileMetadata,
  } from '$lib/types'
  import { VectorTileData } from '$lib/VectorTileData'
  import { Accordion, Radios } from '@undp-data/svelte-undp-design'
  import type { Radio } from '@undp-data/svelte-undp-design/package/interfaces'
  import MiniMap from '$components/data-view/MiniMap.svelte'
  import { map, layerList, indicatorProgress } from '$stores'
  import DataCardInfo from '$components/data-view/DataCardInfo.svelte'
  import AddLayerButton from '$components/data-view/AddLayerButton.svelte'
  import DataStacAssetCard from '$components/data-view/DataStacAssetCard.svelte'

  export let feature: StacItemFeature
  export let isExpanded: boolean
  let symbolVectorType: 'point' | 'heatmap' = 'point'
  let symbolVectorTypes: Radio[] = [
    {
      label: 'Point',
      value: 'point',
    },
    {
      label: 'Heatmap',
      value: 'heatmap',
    },
  ]
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
          const rasterTile = new RasterTileData($map, feature)
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
      } else {
        // vector tile

        let layerType: 'point' | 'heatmap'
        if (
          tags &&
          (['point', 'multipoint'].includes(tags.find((t) => t.key === 'geometrytype')?.value.toLowerCase()) ||
            ['point', 'multipoint'].includes(tags.find((t) => t.key === 'geometry_type')?.value.toLowerCase()))
        ) {
          layerType = symbolVectorType
        }
        const vectorTile = new VectorTileData($map, feature)
        const data = await vectorTile.add(layerType, defaultColor)

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

{#if feature}
  <Accordion
    headerTitle={feature.properties.name}
    bind:isExpanded>
    <div slot="button">
      {#if !stacType && !isExpanded}
        <AddLayerButton
          title="Add layer"
          isIconButton={true}
          on:clicked={addLayer} />
      {/if}
    </div>
    <div
      slot="content"
      class="card-container px-1"
      bind:clientWidth>
      <!-- <p class="title is-5">{feature.properties.name}</p> -->
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

      {#if !is_raster}
        {#if tags && (['point', 'multipoint'].includes(tags
              .find((t) => t.key === 'geometrytype')
              ?.value.toLowerCase()) || ['point', 'multipoint'].includes(tags
                .find((t) => t.key === 'geometry_type')
                ?.value.toLowerCase()))}
          <p class="subtitle is-6 m-0 p-0 pb-1">Select layer type before adding layer.</p>

          <div class="vector-symbol-radios">
            <Radios
              bind:radios={symbolVectorTypes}
              bind:value={symbolVectorType}
              groupName="vector-type"
              isVertical={false} />
          </div>
        {/if}
      {/if}

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
</style>
