import { v4 as uuidv4 } from 'uuid'
import { getActiveBandIndex, getBase64EncodedUrl, getRandomColormap, paramsToQueryString } from './helper'
import type { RasterTileMetadata, StacItemFeature } from './types'
import { PUBLIC_TITILER_ENDPOINT } from './variables/public'
import type { Map, RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl'

export class RasterTileData {
  private feature: StacItemFeature
  private map: Map
  private url: string
  public metadata: RasterTileMetadata

  constructor(map: Map, feature: StacItemFeature) {
    this.map = map
    this.feature = feature
    this.url = feature.properties.url
  }

  private getMetadata = async () => {
    const b64EncodedUrl = getBase64EncodedUrl(this.url)
    const res = await fetch(`${PUBLIC_TITILER_ENDPOINT}/info?url=${b64EncodedUrl}`)
    const data: RasterTileMetadata = await res.json()
    this.metadata = data
    if (
      data &&
      data.band_metadata &&
      data.band_metadata.length > 0 &&
      //TODO needs fix: Ioan band
      Object.keys(data.band_metadata[0][1]).length === 0
    ) {
      const resStatistics = await fetch(`${PUBLIC_TITILER_ENDPOINT}/statistics?url=${b64EncodedUrl}`)
      const statistics = await resStatistics.json()
      if (statistics) {
        for (let i = 0; i < data.band_metadata.length; i++) {
          const bandValue = data.band_metadata[i][0]
          const bandDetails = statistics[bandValue]
          if (bandDetails) {
            data.band_metadata[i][1] = {
              STATISTICS_MAXIMUM: `${bandDetails.max}`,
              STATISTICS_MEAN: `${bandDetails.mean}`,
              STATISTICS_MINIMUM: `${bandDetails.min}`,
              STATISTICS_STDDEV: `${bandDetails.std}`,
              STATISTICS_VALID_PERCENT: `${bandDetails.valid_percent}`,
            }
          }
        }
      }
    }

    return data
  }

  public add = async () => {
    const b64EncodedUrl = getBase64EncodedUrl(this.url)
    const rasterInfo = await this.getMetadata()
    const bandIndex = getActiveBandIndex(rasterInfo)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [bandName, bandMetaStats] = rasterInfo.band_metadata[bandIndex]
    bandMetaStats.STATISTICS_UNIQUE_VALUES = await this.getClassesMap(bandIndex, rasterInfo)

    const layerBandMetadataMin = rasterInfo.band_metadata[bandIndex][1]['STATISTICS_MINIMUM']
    const layerBandMetadataMax = rasterInfo.band_metadata[bandIndex][1]['STATISTICS_MAXIMUM']

    // choose default colormap randomly
    const colormap = getRandomColormap()
    const titilerApiUrlParams = {
      scale: 1,
      TileMatrixSetId: 'WebMercatorQuad',
      url: b64EncodedUrl,
      bidx: bandIndex + 1,
      unscale: false,
      resampling: 'nearest',
      rescale: `${layerBandMetadataMin},${layerBandMetadataMax}`,
      return_mask: true,
      colormap_name: colormap,
    }
    const tileUrl = `${PUBLIC_TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?${paramsToQueryString(titilerApiUrlParams)}`
    const maxzoom = Number(rasterInfo.maxzoom && rasterInfo.maxzoom <= 24 ? rasterInfo.maxzoom : 24)

    const source: RasterSourceSpecification = {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      minzoom: 0,
      maxzoom: maxzoom ?? 22,
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

    const layerId = uuidv4()
    const layer: RasterLayerSpecification = {
      id: layerId,
      type: 'raster',
      source: sourceId,
      minzoom: source.minzoom,
      layout: {
        visibility: 'visible',
      },
    }

    let firstSymbolId = undefined
    for (const layer of this.map.getStyle().layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id
        break
      }
    }
    this.map.addLayer(layer, firstSymbolId)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.map.fitBounds(rasterInfo.bounds)

    return {
      layer,
      source,
      sourceId,
      metadata: rasterInfo,
    }
  }

  private getClassesMap = async (bandIndex: number, layerInfo: RasterTileMetadata) => {
    let classesMap = {}
    // local rasters
    const uvString = layerInfo.band_metadata[bandIndex][1]['STATISTICS_UNIQUE_VALUES']
    if (uvString) {
      classesMap = JSON.parse(uvString)
    }
    return classesMap
  }
}
