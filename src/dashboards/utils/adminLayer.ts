import type { SourceSpecification, FillLayerSpecification, LineLayerSpecification, PointLike } from 'maplibre-gl'
import { LayerTypes } from '$lib/constants'
import { admin } from '../stores/index'
import { get } from 'svelte/store'
import { map as mapStore, year as yearStore } from '../stores/index'

import { PUBLIC_AZURE_URL } from '$lib/variables/public'
const ADM_ID = 'admin'
const ADM0_ID = 'admin0'
let adminLevel = 0
let hoveredStateId = null
let choropleth = true
let opacity = 0.8

export const getChoropleth = () => choropleth

export const setOpacity = (value: number) => {
  opacity = value
}

const getAdminLevel = () => {
  const map = get(mapStore)
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

export const onInteraction = () => {
  const map = get(mapStore)
  map.on('mousemove', ADM_ID, onMouseMove)
  map.on('mouseleave', ADM_ID, onMouseLeave)
}

export const offInteraction = () => {
  const map = get(mapStore)
  map.off('mousemove', ADM_ID, onMouseMove)
  map.off('mouseleave', ADM_ID, onMouseLeave)
}

const onMouseMove = (e) => {
  const map = get(mapStore)
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

const onMouseLeave = () => {
  const map = get(mapStore)
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

const onZoom = ({ originalEvent }) => {
  const map = get(mapStore)
  if (!originalEvent) return
  const zoom = map.getZoom()
  loadAdmin(choropleth)
  //console.log(`zoom is ${zoom}`)
  // if (adminLevel !== 0 && zoom < 3) loadAdmin(choropleth)
  // else if (adminLevel !== 1 && zoom >= 3 && zoom < 4) loadAdmin(choropleth)
  // else if (adminLevel !== 2 && zoom >= 4 && zoom < 5) loadAdmin(choropleth)
  // else if (adminLevel !== 3 && zoom >= 5 && zoom < 6) loadAdmin(choropleth)
  // else if (adminLevel !== 4 && zoom >= 6) loadAdmin(choropleth)
  adminLevel = getAdminLevel()
  const point: PointLike = [originalEvent.layerX, originalEvent.layerY]
  const features = map.queryRenderedFeatures(point, { layers: [ADM_ID] })
  if (features.length > 0) onMouseMove({ features })
  //const l = map.getLayer(ADM_ID)

  //if(l) console.log(`mz is ${l.minzoom} ${l.maxzoom}`)
  //if (zoom>=10) opacity = 0
  map.setPaintProperty(ADM_ID, 'fill-opacity', opacity)
}

const loadAdmin0 = () => {
  const map = get(mapStore)
  const layerSource: SourceSpecification = {
    type: LayerTypes.VECTOR,
    maxzoom: 10,
    promoteId: 'adm0_id',
    tiles: [`${PUBLIC_AZURE_URL}/admin/adm0_polygons/{z}/{x}/{y}.pbf`],
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

export const loadAdmin = (isChoropleth: boolean) => {
  const map = get(mapStore)
  choropleth = isChoropleth
  adminLevel = getAdminLevel()
  unloadAdmin()
  if (choropleth) loadAdminChoropleth()
  else loadAdminHover()
  onInteraction()
  map.on('zoom', onZoom)
}

export const reloadAdmin = () => {
  const map = get(mapStore)
  if (choropleth) {
    map.setPaintProperty(ADM_ID, 'fill-color', getFillColor())
  }
}

export const unloadAdmin = () => {
  const map = get(mapStore)
  offInteraction()
  map.off('zoom', onZoom)
  map.getLayer(ADM0_ID) && map.removeLayer(ADM0_ID)
  map.getSource(ADM0_ID) && map.removeSource(ADM0_ID)
  map.getLayer(ADM_ID) && map.removeLayer(ADM_ID)
  map.getSource(ADM_ID) && map.removeSource(ADM_ID)
}

const getFillColor = () => {
  const year = get(yearStore) || 2020
  return [
    'case',
    ['==', ['get', `hrea_${year}`], null],
    'hsla(0, 0%, 0%, 0)',
    [
      'interpolate',
      ['linear'],
      ['get', `hrea_${year}`],
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
  ]
}

const loadAdminChoropleth = () => {
  const map = get(mapStore)
  const lvl = getAdminLevel()
  let maxzoom = 0
  let minzoom = 3
  if (lvl == 1) {
    ;(minzoom = 3), (maxzoom = 6)
  }
  if (lvl == 2) {
    ;(minzoom = 6), (maxzoom = 9)
  }
  if (lvl == 3) {
    ;(minzoom = 9), (maxzoom = 11)
  }
  if (lvl == 4) {
    ;(minzoom = 11), (maxzoom = 12)
  }

  const layerSource: SourceSpecification = {
    type: LayerTypes.VECTOR,
    maxzoom: 10,
    promoteId: `adm${lvl}_id`,
    tiles: [`${PUBLIC_AZURE_URL}/admin/adm${lvl}_polygons/{z}/{x}/{y}.pbf`],
  }
  const layerFill: FillLayerSpecification = {
    id: ADM_ID,
    type: LayerTypes.FILL,
    source: ADM_ID,
    'source-layer': `adm${lvl}_polygons`,

    maxzoom: maxzoom,
    paint: {
      'fill-color': getFillColor(),
      'fill-opacity': 0.9,
      'fill-outline-color': [
        'case',
        ['boolean', ['feature-state', 'hover'], false],
        'hsla(0, 0%, 0%, 1)',
        'hsla(0, 0%, 100%, 0.5)',
      ],
    },
  }
  map.addSource(ADM_ID, layerSource)
  map.getLayer(ADM_ID) && map.removeLayer(ADM_ID)
  map.addLayer(layerFill)
  loadAdmin0()
}

export const loadAdminHover = () => {
  const map = get(mapStore)
  const lvl = getAdminLevel()
  const layerSource: SourceSpecification = {
    type: LayerTypes.VECTOR,
    maxzoom: 10,
    promoteId: `adm${lvl}_id`,
    tiles: [`${PUBLIC_AZURE_URL}/admin/adm${lvl}_polygons/{z}/{x}/{y}.pbf`],
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
        'hsla(0, 0%, 0%, 0.05)',
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
