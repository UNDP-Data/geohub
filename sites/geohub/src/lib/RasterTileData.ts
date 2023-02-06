import { v4 as uuidv4 } from 'uuid'
import { getActiveBandIndex, getBase64EncodedUrl, getRandomColormap, paramsToQueryString } from './helper'
import type { BandMetadata, RasterTileMetadata, StacItemFeature } from './types'
import { PUBLIC_TITILER_ENDPOINT } from './variables/public'
import type { Map, RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl'
import { MAP_ATTRIBUTION } from './constants'
import chroma from 'chroma-js'

export class RasterTileData {
  private feature: StacItemFeature
  private map: Map
  private url: string
  private metadata: RasterTileMetadata

  constructor(map: Map, feature: StacItemFeature, metadata?: RasterTileMetadata) {
    this.map = map
    this.feature = feature
    this.url = feature.properties.url
    this.metadata = metadata
  }

  public getMetadata = async () => {
    if (this.metadata) return this.metadata
    const b64EncodedUrl = getBase64EncodedUrl(this.url)
    const res = await fetch(`${PUBLIC_TITILER_ENDPOINT}/info?url=${b64EncodedUrl}`)
    this.metadata = await res.json()
    if (
      this.metadata &&
      this.metadata.band_metadata &&
      this.metadata.band_metadata.length > 0 &&
      //TODO needs fix: Ioan band
      Object.keys(this.metadata.band_metadata[0][1]).length === 0
    ) {
      const resStatistics = await fetch(`${PUBLIC_TITILER_ENDPOINT}/statistics?url=${b64EncodedUrl}`)
      const statistics = await resStatistics.json()
      if (statistics) {
        for (let i = 0; i < this.metadata.band_metadata.length; i++) {
          const bandValue = this.metadata.band_metadata[i][0] as string
          const bandDetails = statistics[bandValue]
          if (bandDetails) {
            this.metadata.band_metadata[i][1] = {
              STATISTICS_MAXIMUM: bandDetails.max,
              STATISTICS_MEAN: bandDetails.mean,
              STATISTICS_MINIMUM: bandDetails.min,
              STATISTICS_STDDEV: bandDetails.std,
              STATISTICS_VALID_PERCENT: bandDetails.valid_percent,
            }
          }
        }
      }
    }

    return this.metadata
  }

  public add = async (defaultColormap?: string) => {
    const b64EncodedUrl = getBase64EncodedUrl(this.url)
    const rasterInfo = await this.getMetadata()
    const bandIndex = getActiveBandIndex(rasterInfo)

    const bandMetaStats = rasterInfo.band_metadata[bandIndex][1] as BandMetadata
    bandMetaStats.STATISTICS_UNIQUE_VALUES = await this.getClassesMap(bandIndex, rasterInfo)

    const layerBandMetadataMin = bandMetaStats['STATISTICS_MINIMUM']
    const layerBandMetadataMax = bandMetaStats['STATISTICS_MAXIMUM']

    // choose default colormap randomly
    const colormap = defaultColormap ?? getRandomColormap()

    const titilerApiUrlParams = {
      scale: 1,
      TileMatrixSetId: 'WebMercatorQuad',
      url: b64EncodedUrl,
      bidx: bandIndex + 1,
      unscale: false,
      resampling: 'nearest',
      rescale: `${layerBandMetadataMin},${layerBandMetadataMax}`,
      return_mask: true,
      colormap_name: defaultColormap,
    }

    const colorMap = {}
    if (Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES).length > 0) {
      const colorMapKeys = Object.keys(bandMetaStats.STATISTICS_UNIQUE_VALUES)
      const colorsList = chroma.scale(colormap).colors(colorMapKeys.length)
      colorMapKeys.forEach((key, index) => {
        const color = chroma(colorsList[index]).rgba()
        colorMap[key] = [color[0], color[1], color[2], color[3] * 255]
      })
      delete titilerApiUrlParams['colormap_name']
      delete titilerApiUrlParams['rescale']
      titilerApiUrlParams['colormap'] = JSON.stringify(colorMap)
    }

    const tileUrl = `${PUBLIC_TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?${paramsToQueryString(titilerApiUrlParams)}`
    const maxzoom = Number(rasterInfo.maxzoom && rasterInfo.maxzoom <= 24 ? rasterInfo.maxzoom : 24)

    let attribution = MAP_ATTRIBUTION
    if (this.feature.properties.source) {
      attribution = this.feature.properties.source
    }

    const source: RasterSourceSpecification = {
      type: 'raster',
      tiles: [tileUrl],
      tileSize: 256,
      minzoom: 0,
      maxzoom: maxzoom ?? 22,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      bounds: rasterInfo['bounds'],
      attribution,
    }
    const layerId = uuidv4()
    //const sourceId = this.feature.properties.id
    const sourceId = layerId
    if (!this.map.getSource(sourceId)) {
      this.map.addSource(sourceId, source)
    }

    if (this.map.getLayer(this.feature.properties.id)) {
      this.map.removeLayer(this.feature.properties.id)
    }

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
      colorMapName: colormap,
    }
  }

  private getClassesMap = async (bandIndex: number, layerInfo: RasterTileMetadata) => {
    let classesMap = {}
    // local rasters
    const uvString = layerInfo.band_metadata[bandIndex][1]['STATISTICS_UNIQUE_VALUES']
    if (!uvString) return classesMap
    if (uvString && uvString.length > 0) {
      classesMap = JSON.parse(uvString)
    }
    return classesMap
  }
}
