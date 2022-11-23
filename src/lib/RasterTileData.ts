import { DEFAULT_COLORMAP } from './constants'
import { getActiveBandIndex, getBase64EncodedUrl, paramsToQueryString } from './helper'
import type { RasterTileMetadata, StacItemFeature } from './types'
import { PUBLIC_TITILER_ENDPOINT } from './variables/public'
import type { Map, RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl'

export class RasterTileData {
  private feature: StacItemFeature
  private map: Map
  private url: string
  constructor(map: Map, feature: StacItemFeature) {
    this.map = map
    this.feature = feature
    this.url = feature.properties.url
  }

  private getMetadata = async () => {
    const b64EncodedUrl = getBase64EncodedUrl(this.url)
    const res = await fetch(`${PUBLIC_TITILER_ENDPOINT}/info?url=${b64EncodedUrl}`)
    const json: RasterTileMetadata = await res.json()
    return json
  }

  public add = async () => {
    const b64EncodedUrl = getBase64EncodedUrl(this.url)
    const rasterInfo = await this.getMetadata()
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

    const source: RasterSourceSpecification = {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      minzoom: rasterInfo.minzoom | 0,
      maxzoom: rasterInfo.maxzoom | 22,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      bounds: rasterInfo['bounds'],
    }

    const sourceId = this.feature.properties.id
    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, source)
    }

    if (this.map.getLayer(this.feature.properties.id)) {
      this.map.removeLayer(this.feature.properties.id)
    }

    const layer: RasterLayerSpecification = {
      id: this.feature.properties.id,
      type: 'raster',
      source: sourceId,
      layout: {
        visibility: 'visible',
      },
    }
    this.map.addLayer(layer)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.map.fitBounds(rasterInfo.bounds)

    return {
      layer,
      source,
      sourceId,
    }
  }
}
