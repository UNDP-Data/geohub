import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_FILL_COLOR, DEFAULT_FILL_OUTLINE_COLOR, DEFAULT_LINE_COLOR, DEFAULT_LINE_WIDTH } from './constants'
import type { StacItemFeature, VectorTileMetadata } from './types'
import {
  LngLatBounds,
  type FillLayerSpecification,
  type LineLayerSpecification,
  type Map,
  type SymbolLayerSpecification,
  type VectorSourceSpecification,
} from 'maplibre-gl'

export class VectorTileData {
  private feature: StacItemFeature
  private map: Map
  private url: string
  public metadata: VectorTileMetadata

  constructor(map: Map, feature: StacItemFeature) {
    this.map = map
    this.feature = feature
    this.url = feature.properties.url
  }

  private getMetadata = async () => {
    const tags: [{ key: string; value: string }] = this.feature.properties.tags as unknown as [
      { key: string; value: string },
    ]
    const type = tags?.find((tag) => tag.key === 'type')
    let metadataUrl: string
    if (type && ['martin', 'pgtileserv'].includes(type.value)) {
      // dynamic
      if (type.value === 'pgtileserv') {
        const layertype = tags?.find((tag) => tag.key === 'layertype')
        metadataUrl = `/${type.value}/${layertype.value}/${this.feature.properties.name}/metadata.json`
      } else {
        metadataUrl = `/${type.value}/${this.feature.properties.name}/metadata.json`
      }
    } else {
      // static
      const layerURL = new URL(this.url.replace('/{z}/{x}/{y}', '/0/0/0'))
      const pbfpath = `${layerURL.origin}${decodeURIComponent(layerURL.pathname)}${layerURL.search}`
      metadataUrl = `/azstorage/metadata.json?pbfpath=${encodeURI(pbfpath)}`
    }
    const res = await fetch(metadataUrl)
    const data: VectorTileMetadata = await res.json()
    this.metadata = data
    return {
      metadata: data,
      type: type,
      url: metadataUrl,
    }
  }

  public add = async () => {
    const vectorInfo = await this.getMetadata()

    const tileSourceId = this.feature.properties.id
    const selectedLayerId = vectorInfo.metadata.json.vector_layers[0].id

    const maxzoom = Number(
      vectorInfo.metadata.maxzoom && vectorInfo.metadata.maxzoom <= 24 ? vectorInfo.metadata.maxzoom : 24,
    )

    let source: VectorSourceSpecification
    if (vectorInfo.type) {
      source = {
        type: 'vector',
        url: vectorInfo.url.replace('metadata.json', 'tile.json'),
      }
    } else {
      source = {
        type: 'vector',
        tiles: [this.url],
        minzoom: 0,
        maxzoom: maxzoom,
      }
    }
    this.map.addSource(tileSourceId, source)

    const layerId = uuidv4()
    let layer: LineLayerSpecification | FillLayerSpecification | SymbolLayerSpecification

    const geomType = vectorInfo.metadata.json.tilestats.layers[0].geometry
    switch (geomType.toLocaleLowerCase()) {
      case 'point':
      case 'multipoint':
        layer = {
          id: layerId,
          type: 'symbol',
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
            'icon-image': 'circle',
            'icon-size': 1,
          },
        }
        break
      case 'linestring':
      case 'multilinestring':
        layer = {
          id: layerId,
          type: 'line',
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': DEFAULT_LINE_COLOR,
            'line-width': DEFAULT_LINE_WIDTH,
          },
        }
        break
      case 'polygon':
      case 'multipolygon':
        layer = {
          id: layerId,
          type: 'fill',
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
          },
          paint: {
            'fill-color': DEFAULT_FILL_COLOR,
            'fill-outline-color': DEFAULT_FILL_OUTLINE_COLOR,
            'fill-opacity': 0.6,
          },
        }
        break
      default:
        return
    }
    layer.minzoom = 0
    layer.maxzoom = maxzoom

    this.map.addLayer(layer)
    const bounds = vectorInfo.metadata.bounds.split(',').map((val) => Number(val))
    this.map.fitBounds(new LngLatBounds([bounds[0], bounds[1]], [bounds[2], bounds[3]]))

    return {
      layer,
      source,
      sourceId: tileSourceId,
      metadata: vectorInfo.metadata,
    }
  }
}
