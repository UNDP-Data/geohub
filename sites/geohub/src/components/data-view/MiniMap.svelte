<script lang="ts">
  import maplibregl, { Map, NavigationControl } from 'maplibre-gl'
  import * as pmtiles from 'pmtiles'
  import { styles } from '$lib/constants'
  import type {
    RasterTileMetadata,
    StacCollection,
    StacItemFeature,
    StacItemFeatureCollection,
    VectorLayerTileStatLayer,
    VectorTileMetadata,
  } from '$lib/types'
  import { RasterTileData } from '$lib/RasterTileData'
  import { VectorTileData } from '$lib/VectorTileData'
  import { Loader } from '@undp-data/svelte-undp-design'

  export let feature: StacItemFeature
  export let width = '100%'
  export let height = '100%'
  export let isLoadMap = false
  export let defaultColor: string = undefined
  export let defaultColormap: string = undefined
  export let layer: VectorLayerTileStatLayer = undefined

  const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [{ key: string; value: string }]

  let protocol = new pmtiles.Protocol()
  maplibregl.addProtocol('pmtiles', protocol.tile)

  let mapContainer: HTMLDivElement
  let map: Map
  let previewImageUrl: string
  let isLoading = false

  export let metadata: RasterTileMetadata | VectorTileMetadata = undefined

  $: if (isLoadMap === true) {
    if (!map) {
      loadMiniMap()
    }
  }
  const loadMiniMap = async () => {
    if (!mapContainer) return
    isLoading = true
    map = new Map({
      container: mapContainer,
      style: styles[0].uri,
      attributionControl: false,
      // interactive: false,
    })
    map.addControl(
      new NavigationControl({
        showCompass: false,
      }),
      'bottom-right',
    )
    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    // console.log(feature)
    map.on('load', async () => {
      try {
        const is_raster: boolean = feature.properties.is_raster as unknown as boolean
        const url: string = feature.properties.url

        if (is_raster) {
          const tags: [{ key: string; value: string }] = feature.properties.tags as unknown as [
            { key: string; value: string },
          ]
          const type = tags?.find((tag) => tag.key === 'stac')
          if (type) {
            previewImageUrl = await addStacPreview(url)
            return
          }
        }

        if (is_raster === true) {
          const rasterInfo = metadata as RasterTileMetadata
          const rasterTile = new RasterTileData(map, feature, rasterInfo)
          const data = await rasterTile.add()
          metadata = data.metadata
          defaultColormap = data.colormap
        } else {
          const vectorInfo = metadata as VectorTileMetadata
          const vectorTile = new VectorTileData(map, feature, vectorInfo)
          let layerName = layer ? layer.layer : undefined
          let layerType: 'point' | 'heatmap' = undefined
          if (layer?.geometry.toLocaleLowerCase() === 'point') {
            layerType = 'point'
          }
          const data = await vectorTile.add(layerType, undefined, layerName)
          metadata = data.metadata
          defaultColor = data.color
        }
      } finally {
        isLoading = false
      }
    })
  }

  const addStacPreview = async (url: string) => {
    const res = await fetch(url.replace('/items', ''))
    const collection: StacCollection = await res.json()
    let previewImage = collection.assets?.thumbnail?.href
    if (previewImage) {
      return previewImage
    }
    const resItems = await fetch(`${url}?limit=1`)
    const fc: StacItemFeatureCollection = await resItems.json()
    previewImage = fc.features[0].assets.thumbnail?.href
    return previewImage
  }
</script>

<div class="map-container">
  {#if isLoading}
    <div class="loader-container"><Loader size="small" /></div>
  {/if}

  {#if !previewImageUrl}
    <div
      class="map"
      style="width:{width}; height:{height}"
      bind:this={mapContainer} />
  {:else}
    <!-- svelte-ignore a11y-missing-attribute -->
    <img
      src={previewImageUrl}
      style="width:{width}" />
  {/if}
</div>

<style lang="scss">
  .map-container {
    position: relative;
    text-align: center;
    vertical-align: middle;

    .loader-container {
      position: absolute;
      z-index: 10;
      top: 45%;
      left: 45%;
    }

    .map {
      padding: 0;
      margin: 0;
      border: 1px solid gray;
    }
  }
</style>
