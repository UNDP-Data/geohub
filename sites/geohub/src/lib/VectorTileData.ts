import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_LINE_WIDTH } from './constants'
import type { StacItemFeature, VectorTileMetadata } from './types'
import {
  LngLatBounds,
  type FillLayerSpecification,
  type HeatmapLayerSpecification,
  type LineLayerSpecification,
  type Map,
  type SymbolLayerSpecification,
  type VectorSourceSpecification,
} from 'maplibre-gl'
import chroma from 'chroma-js'

export class VectorTileData {
  private feature: StacItemFeature
  private map: Map
  private url: string

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
      const id = tags.find((t) => t.key === 'id')
      if (type.value === 'pgtileserv') {
        const layertype = tags?.find((tag) => tag.key === 'layertype')
        metadataUrl = `/api/vector/${type.value}/metadata.json?table=${id.value}&type=${layertype.value}`
      } else {
        metadataUrl = `/api/vector/${type.value}/metadata.json?table=${id.value}`
      }
    } else {
      // static
      if (this.url.startsWith('pmtiles://')) {
        metadataUrl = `/api/vector/azstorage/metadata.json?pbfpath=${encodeURI(this.url)}`
      } else {
        const layerURL = new URL(this.url.replace('/{z}/{x}/{y}', '/0/0/0'))
        const pbfpath = `${layerURL.origin}${decodeURIComponent(layerURL.pathname)}${layerURL.search}`
        metadataUrl = `/api/vector/azstorage/metadata.json?pbfpath=${encodeURI(pbfpath)}`
      }
    }
    const res = await fetch(metadataUrl)
    const data: VectorTileMetadata = await res.json()

    return {
      metadata: data,
      type: type,
      url: metadataUrl,
    }
  }

  public add = async (layerType?: 'point' | 'heatmap', defaultColor?: string) => {
    const vectorInfo = await this.getMetadata()

    const tileSourceId = this.feature.properties.id
    const selectedLayerId = vectorInfo.metadata.json.vector_layers[0].id

    const maxzoom = Number(
      vectorInfo.metadata.maxzoom && vectorInfo.metadata.maxzoom <= 24 ? vectorInfo.metadata.maxzoom : 24,
    )
    const isPmtiles = this.url.startsWith('pmtiles://')
    let source: VectorSourceSpecification
    if (vectorInfo.type) {
      source = {
        type: 'vector',
        url: vectorInfo.url.replace('metadata.json', 'tile.json'),
      }
    } else if (isPmtiles) {
      source = {
        type: 'vector',
        url: this.url,
        attribution: vectorInfo.metadata.attribution,
      }
    } else {
      source = {
        type: 'vector',
        tiles: [this.url],
        minzoom: 0,
        maxzoom: maxzoom,
      }
    }

    if (!this.map.getSource(tileSourceId)) {
      this.map.addSource(tileSourceId, source)
    }

    const layerId = uuidv4()
    let layer: LineLayerSpecification | FillLayerSpecification | SymbolLayerSpecification | HeatmapLayerSpecification

    const geomType = layerType ?? vectorInfo.metadata.json.tilestats.layers[0].geometry
    const color = defaultColor ? chroma(defaultColor) : chroma.random()
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
          paint: {
            'icon-color': color.hex(),
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
            'line-color': color.hex(),
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
            'fill-color': color.hex(),
            'fill-outline-color': color.darken(2.6).hex(),
            'fill-opacity': 0.6,
          },
        }
        break
      case 'heatmap':
        layer = {
          id: layerId,
          type: 'heatmap',
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
          },
          paint: {
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(0, 0, 255, 0)',
              0.1,
              'rgb(0,0,255)',
              0.3,
              'rgb(0,255,255)',
              0.5,
              'rgb(0,255,0)',
              0.7,
              'rgb(255,255,0)',
              1,
              'rgb(255,0,0)',
            ],
            'heatmap-intensity': 1,
            'heatmap-opacity': 1,
            'heatmap-radius': 30,
            'heatmap-weight': 1,
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
      color: color.hex(),
    }
  }
}
