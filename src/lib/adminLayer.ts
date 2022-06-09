import type { Map, SourceSpecification, FillLayerSpecification, PointLike } from 'maplibre-gl'
import { LayerTypes } from '$lib/constants'

export default class AdminLayer {
  private BASE_URL: string
  private ADM_ID = 'admin'
  private adminLevel = 0
  private hoveredStateId = null
  private isHover: boolean

  private map: Map

  constructor(map: Map, baseUrl: string, isHover = true) {
    this.map = map
    this.BASE_URL = baseUrl
    this.isHover = isHover
  }

  public getAdminID() {
    return this.ADM_ID
  }

  public load() {
    const lvl = this.getAdminLevel()
    const layerSource: SourceSpecification = {
      type: LayerTypes.VECTOR,
      maxzoom: 10,
      promoteId: `adm${lvl}_id`,
      tiles: [`${this.BASE_URL}/admin/adm${lvl}_polygons/{z}/{x}/{y}.pbf`],
    }
    const layerFill: FillLayerSpecification = {
      id: this.ADM_ID,
      type: LayerTypes.FILL,
      source: this.ADM_ID,
      'source-layer': `adm${lvl}_polygons`,
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          'hsla(0, 0%, 0%, 0.25)',
          'hsla(0, 0%, 0%, 0)',
        ],
        'fill-outline-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          'hsla(0, 0%, 0%, 1)',
          'hsla(0, 0%, 0%, 0)',
        ],
      },
    }
    this.map.getLayer(this.ADM_ID) && this.map.removeLayer(this.ADM_ID)
    this.map.getSource(this.ADM_ID) && this.map.removeSource(this.ADM_ID)
    this.map.addSource(this.ADM_ID, layerSource)
    this.map.addLayer(layerFill)
  }

  public getAdminLevel() {
    const zoom = this.map.getZoom()
    if (zoom < 3) return 0
    if (zoom < 4) return 1
    if (zoom < 5) return 2
    if (zoom < 6) return 3
    return 4
  }

  private getAdminLayer() {
    return `adm${this.adminLevel}_polygons`
  }

  public setInteraction() {
    this.adminLevel = this.getAdminLevel()
    this.map.on('mousemove', this.ADM_ID, this.onAdminMouseMove.bind(this))
    this.map.on('mouseleave', this.ADM_ID, this.onAdminMouseLeave.bind(this))
    this.map.on('zoom', this.onAdminZoom.bind(this))
  }

  public removeInteraction() {
    this.map.off('mousemove', this.ADM_ID, this.onAdminMouseMove.bind(this))
    this.map.off('mouseleave', this.ADM_ID, this.onAdminMouseLeave.bind(this))
    this.map.off('zoom', this.onAdminZoom.bind(this))
  }

  private onAdminZoom({ originalEvent }) {
    if (!originalEvent) return
    const zoom = this.map.getZoom()
    if (this.adminLevel !== 0 && zoom < 3) this.load()
    else if (this.adminLevel !== 1 && zoom >= 3 && zoom < 4) this.load()
    else if (this.adminLevel !== 2 && zoom >= 4 && zoom < 5) this.load()
    else if (this.adminLevel !== 3 && zoom >= 5 && zoom < 6) this.load()
    else if (this.adminLevel !== 4 && zoom >= 6) this.load()
    this.adminLevel = this.getAdminLevel()
    const point: PointLike = [originalEvent.layerX, originalEvent.layerY]
    const features = this.map.queryRenderedFeatures(point, { layers: [this.ADM_ID] })
    if (features.length > 0) this.onAdminMouseMove({ features })
  }

  onAdminMouseMove(e) {
    if (e.features.length > 0) {
      if (this.hoveredStateId) {
        this.map.setFeatureState(
          {
            source: this.ADM_ID,
            sourceLayer: this.getAdminLayer(),
            id: this.hoveredStateId,
          },
          { hover: false },
        )
      }
      this.hoveredStateId = e.features[0].id
      this.map.setFeatureState(
        {
          source: this.ADM_ID,
          sourceLayer: this.getAdminLayer(),
          id: this.hoveredStateId,
        },
        { hover: this.isHover },
      )
    }
  }

  onAdminMouseLeave() {
    if (this.hoveredStateId) {
      this.map.setFeatureState(
        {
          source: this.ADM_ID,
          sourceLayer: this.getAdminLayer(),
          id: this.hoveredStateId,
        },
        { hover: false },
      )
    }
    this.hoveredStateId = null
  }
}
