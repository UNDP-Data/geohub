<script lang="ts">
  import { GeoJSONFeature, Map } from 'maplibre-gl'
  import { DEFAULT_COLORMAP, styles } from '$lib/constants'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import type { RasterTileMetadata, StacItemFeature } from '$lib/types'
  import { getActiveBandIndex, getBase64EncodedUrl, paramsToQueryString } from '$lib/helper'

  export let feature: GeoJSONFeature | StacItemFeature
  export let width: number
  export let height: number
  export let isLoadMap = false

  let mapContainer: HTMLDivElement
  let map: Map

  $: if (isLoadMap === true) {
    if (!map) {
      loadMiniMap()
    }
  }
  const loadMiniMap = async () => {
    map = new Map({
      container: mapContainer,
      style: styles[0].uri,
      attributionControl: false,
      interactive: false,
    })

    // console.log(feature)
    map.on('load', async () => {
      const is_raster: boolean = feature.properties.is_raster
      const url: string = feature.properties.url
      if (is_raster === true) {
        // TODO: implement for STAC source
        const b64EncodedUrl = getBase64EncodedUrl(url)
        const rasterInfo = await getRasterInfo(b64EncodedUrl)
        // console.log(rasterInfo)
        const bandIndex = getActiveBandIndex(rasterInfo)
        const layerBandMetadataMin = rasterInfo.band_metadata[bandIndex][1]['STATISTICS_MINIMUM']
        const layerBandMetadataMax = rasterInfo.band_metadata[bandIndex][1]['STATISTICS_MAXIMUM']

        const titilerApiUrlParams = {
          scale: 1,
          TileMatrixSetId: 'WebMercatorQuad',
          url: b64EncodedUrl,
          bidx: bandIndex + 1,
          unscale: false,
          resampling: 'nearest',
          rescale: `${layerBandMetadataMin},${layerBandMetadataMax}`,
          return_mask: true,
          colormap_name: DEFAULT_COLORMAP,
        }
        const tileUrl = `${PUBLIC_TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?${paramsToQueryString(titilerApiUrlParams)}`
        // const tilejson = await getTileJson(tilejsonUrl)

        map.addSource(feature.properties.id, {
          type: 'raster',
          tiles: [tileUrl],
          tileSize: 256,
          minzoom: rasterInfo.minzoom | 0,
          maxzoom: rasterInfo.maxzoom | 22,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          bounds: rasterInfo['bounds'],
        })

        map.addLayer({
          id: feature.properties.id,
          type: 'raster',
          source: feature.properties.id,
          layout: {
            visibility: 'visible',
          },
        })

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        map.fitBounds(rasterInfo.bounds)
      } else {
        // TODO: implement for vector tile source
      }
    })
  }

  const getRasterInfo = async (url: string) => {
    const res = await fetch(`${PUBLIC_TITILER_ENDPOINT}/info?url=${url}`)
    const json: RasterTileMetadata = await res.json()
    return json
  }
</script>

<div
  class="map"
  style="width:{width}px; height:{height}px"
  bind:this={mapContainer} />

<style lang="scss">
  .map {
    padding: 0;
    margin: 0;
  }
</style>
