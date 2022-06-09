import type { SourceSpecification, FillLayerSpecification, LineLayerSpecification, PointLike } from 'maplibre-gl'
import { LayerTypes } from '$lib/constants'
import { admin } from '../stores/index'
import { get } from 'svelte/store'
import { map as dashboardMap } from '../stores/index'

const BASE_URL = import.meta.env.VITE_ADMIN_URL
const ADM_ID = 'admin'
const ADM0_ID = 'admin0'
let adminLevel = 0
let hoveredStateId = null

const getAdminLevel = () => {
  const map = get(dashboardMap)
  const zoom = map.getZoom()
  if (zoom < 3) return 0
  if (zoom < 4) return 1
  if (zoom < 5) return 2
  if (zoom < 6) return 3
  return 4
}

const getAdminLayer = () => {
  return `adm${adminLevel}_polygons`
}

const onAdminZoom = ({ originalEvent }) => {
  const map = get(dashboardMap)
  if (!originalEvent) return
  const zoom = map.getZoom()
  if (adminLevel !== 0 && zoom < 3) loadAdmin(true)
  else if (adminLevel !== 1 && zoom >= 3 && zoom < 4) loadAdmin(true)
  else if (adminLevel !== 2 && zoom >= 4 && zoom < 5) loadAdmin(true)
  else if (adminLevel !== 3 && zoom >= 5 && zoom < 6) loadAdmin(true)
  else if (adminLevel !== 4 && zoom >= 6) loadAdmin(true)
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

const loadAdmin0 = () => {
  const map = get(dashboardMap)
  const layerSource: SourceSpecification = {
    type: LayerTypes.VECTOR,
    maxzoom: 10,
    promoteId: 'adm0_id',
    tiles: [`${BASE_URL}/admin/adm0_polygons/{z}/{x}/{y}.pbf`],
  }
  const layerLine: LineLayerSpecification = {
    id: ADM0_ID,
    type: LayerTypes.LINE,
    source: ADM0_ID,
    'source-layer': 'adm0_polygons',
    paint: {
      'line-color': 'hsla(0, 0%, 100%, 0.9)',
    },
    filter: ['has', 'hrea_2020'],
  }
  map.addSource(ADM0_ID, layerSource)
  map.addLayer(layerLine)
}

export const loadAdmin = (choropleth: boolean) => {
  unloadAdmin()
  if (choropleth) loadAdminChoropleth()
  else {
    loadAdminHover()
  }
}

export const unloadAdmin = () => {
  const map = get(dashboardMap)
  map.getLayer(ADM0_ID) && map.removeLayer(ADM0_ID)
  map.getSource(ADM0_ID) && map.removeSource(ADM0_ID)
  map.getLayer(ADM_ID) && map.removeLayer(ADM_ID)
  map.getSource(ADM_ID) && map.removeSource(ADM_ID)
}

const loadAdminChoropleth = () => {
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
        ['==', ['get', 'hrea_2020'], null],
        'hsla(0, 0%, 0%, 0)',
        [
          'interpolate',
          ['linear'],
          ['get', 'hrea_2020'],
          0,
          ['to-color', '#d7191c'],
          0.25,
          ['to-color', '#fdae61'],
          0.5,
          ['to-color', '#ffffbf'],
          0.75,
          ['to-color', '#abd9e9'],
          1,
          ['to-color', '#2c7bb6'],
        ],
      ],
      'fill-opacity': 0.9,
      'fill-outline-color': 'hsla(0, 0%, 100%, 0.5)',
    },
  }
  map.addSource(ADM_ID, layerSource)
  map.addLayer(layerFill)
  loadAdmin0()
}

export const loadAdminHover = () => {
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
