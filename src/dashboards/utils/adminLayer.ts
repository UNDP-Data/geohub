import type { SourceSpecification, FillLayerSpecification, PointLike } from 'maplibre-gl'
import { LayerTypes } from '$lib/constants'
import { admin } from '../stores/index'
import { get } from 'svelte/store'
import { map as dashboardMap } from '../stores/index'

const BASE_URL = import.meta.env.VITE_AZURE_URL
const ADM_ID = 'admin'
let adminLevel = 0
let hoveredStateId = null

const getAdminLevel = () => {
  const map = get(dashboardMap)
  const zoom = map.getZoom()
  if (zoom < 4) return 0
  if (zoom < 7) return 1
  if (zoom < 9) return 2
  return 3
}

const getAdminLayer = () => {
  return `adm${adminLevel}_polygons`
}

const onAdminZoom = ({ originalEvent }) => {
  const map = get(dashboardMap)
  if (!originalEvent) return
  const zoom = map.getZoom()
  if (adminLevel !== 0 && zoom < 4) loadAdmin()
  else if (adminLevel !== 1 && zoom >= 4 && zoom < 7) loadAdmin()
  else if (adminLevel !== 2 && zoom >= 7 && zoom < 9) loadAdmin()
  else if (adminLevel !== 3 && zoom >= 9) loadAdmin()
  adminLevel = getAdminLevel()
  const point: PointLike = [originalEvent.layerX, originalEvent.layerY]
  const features = map.queryRenderedFeatures(point, { layers: [ADM_ID] })
  if (features.length > 0) onAdminMouseMove({ features })
}

const onAdminMouseMove = (e) => {
  const map = get(dashboardMap)
  if (e.features.length > 0) {
    if (hoveredStateId) {
      map.setFeatureState(
        {
          source: ADM_ID,
          sourceLayer: getAdminLayer(),
          id: hoveredStateId,
        },
        { hover: false },
      )
      admin.set({})
    }
    hoveredStateId = e.features[0].id
    map.setFeatureState(
      {
        source: ADM_ID,
        sourceLayer: getAdminLayer(),
        id: hoveredStateId,
      },
      { hover: true },
    )
    admin.set(e.features[0].properties)
  }
}

const onAdminMouseLeave = () => {
  const map = get(dashboardMap)
  if (hoveredStateId) {
    map.setFeatureState(
      {
        source: ADM_ID,
        sourceLayer: getAdminLayer(),
        id: hoveredStateId,
      },
      { hover: false },
    )
    admin.set({})
  }
  hoveredStateId = null
}

export const loadAdmin = () => {
  const map = get(dashboardMap)
  const lvl = getAdminLevel()
  const layerSource: SourceSpecification = {
    type: LayerTypes.VECTOR,
    maxzoom: 10,
    promoteId: `adm${lvl}_id`,
    tiles: [`${BASE_URL}/admin/adm${lvl}_polygons/{z}/{x}/{y}.pbf`],
  }
  const layerFill: FillLayerSpecification = {
    id: ADM_ID,
    type: LayerTypes.FILL,
    source: ADM_ID,
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
  map.getLayer(ADM_ID) && map.removeLayer(ADM_ID)
  map.getSource(ADM_ID) && map.removeSource(ADM_ID)
  map.addSource(ADM_ID, layerSource)
  map.addLayer(layerFill)
}

export const setInteraction = () => {
  const map = get(dashboardMap)
  adminLevel = getAdminLevel()
  map.on('mousemove', ADM_ID, onAdminMouseMove)
  map.on('mouseleave', ADM_ID, onAdminMouseLeave)
  map.on('zoom', onAdminZoom)
}

export const removeInteraction = () => {
  const map = get(dashboardMap)
  map.off('mousemove', ADM_ID, onAdminMouseMove)
  map.off('mouseleave', ADM_ID, onAdminMouseLeave)
  map.off('zoom', onAdminZoom)
}
