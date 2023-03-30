import { v4 as uuidv4 } from 'uuid'
import type { DatasetFeature, VectorTileMetadata } from './types'
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
  private feature: DatasetFeature
  private url: string
  private metadata: VectorTileMetadata
  private defaultLineWidth: number
  private defaultIconImage: string
  private defaultIconSize: number
  private iconOverlap: 'never' | 'always' | 'cooperative'
  private layerOpacity: number

  constructor(
    feature: DatasetFeature,
    defaultLineWidth: number,
    metadata?: VectorTileMetadata,
    defaultIconImage?: string,
    defaultIconSize?: number,
    iconOverlap?: 'never' | 'always' | 'cooperative',
    layerOpacity?: number,
  ) {
    this.feature = feature
    this.url = feature.properties.url
    this.metadata = metadata
    this.defaultLineWidth = defaultLineWidth
    this.defaultIconImage = defaultIconImage
    this.defaultIconSize = defaultIconSize
    this.iconOverlap = iconOverlap
    this.layerOpacity = layerOpacity
  }

  public getMetadata = async () => {
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
        const layerURL = new URL(this.url.replace('pmtiles://', ''))
        const pmtilesUrl = `${layerURL.origin}${layerURL.pathname}${layerURL.search}`
        metadataUrl = `/api/vector/azstorage/metadata.json?pbfpath=pmtiles://${encodeURIComponent(pmtilesUrl)}`
      } else {
        const layerURL = new URL(this.url.replace('/{z}/{x}/{y}', '/0/0/0'))
        const pbfpath = `${layerURL.origin}${decodeURIComponent(layerURL.pathname)}${layerURL.search}`
        metadataUrl = `/api/vector/azstorage/metadata.json?pbfpath=${encodeURI(pbfpath)}`
      }
    }
    let data: VectorTileMetadata = this.metadata
    if (!data) {
      const res = await fetch(metadataUrl)
      data = await res.json()
    }

    return {
      metadata: data,
      type: type,
      url: metadataUrl,
    }
  }

  public add = async (
    map: Map,
    layerType?: 'point' | 'heatmap' | 'polygon' | 'linestring',
    defaultColor?: string,
    targetLayer?: string,
  ) => {
    const vectorInfo = await this.getMetadata()

    const tileSourceId = this.feature.properties.id
    const selectedLayerId = targetLayer ?? vectorInfo.metadata.json.vector_layers[0].id

    const selectedLayer = vectorInfo.metadata.json.tilestats.layers.find((l) => l.layer === selectedLayerId)

    const maxzoom = Number(
      vectorInfo.metadata.maxzoom && vectorInfo.metadata.maxzoom <= 24 ? vectorInfo.metadata.maxzoom : 24,
    )
    const isPmtiles = this.url.startsWith('pmtiles://')
    let source: VectorSourceSpecification
    if (vectorInfo.type && ['pgtileserv', 'martin'].includes(vectorInfo.type.value)) {
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
        attribution: vectorInfo.metadata.attribution,
        minzoom: 0,
        maxzoom: maxzoom,
      }
    }

    if (!map.getSource(tileSourceId)) {
      map.addSource(tileSourceId, source)
    }

    const layerId = uuidv4()
    let layer: LineLayerSpecification | FillLayerSpecification | SymbolLayerSpecification | HeatmapLayerSpecification

    const geomType = layerType ?? selectedLayer.geometry
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
            'icon-image': this.defaultIconImage ?? 'circle',
            'icon-size': this.defaultIconSize ?? 1,
            'icon-overlap': this.iconOverlap ?? 'never',
          },
          paint: {
            'icon-color': color.hex(),
            'icon-opacity': this.layerOpacity ?? 1,
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
            'line-width': this.defaultLineWidth,
            'line-opacity': this.layerOpacity ?? 1,
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
            'fill-opacity': this.layerOpacity ?? 1,
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
            'heatmap-opacity': this.layerOpacity ?? 1,
            'heatmap-radius': 30,
            'heatmap-weight': 1,
          },
        }
        break
      default:
        return
    }
    layer.minzoom = 0
    // layer.maxzoom = maxzoom

    map.addLayer(layer)
    const bounds = vectorInfo.metadata.bounds.split(',').map((val) => Number(val))
    map.fitBounds(new LngLatBounds([bounds[0], bounds[1]], [bounds[2], bounds[3]]))

    return {
      layer,
      source,
      sourceId: tileSourceId,
      metadata: vectorInfo.metadata,
      color: color.hex(),
    }
  }
}
