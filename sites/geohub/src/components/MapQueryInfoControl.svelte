<script lang="ts">
  import { Map, MapMouseEvent, Popup, type PointLike } from 'maplibre-gl'
  import { layerList } from '$stores'
  import { onMount, onDestroy } from 'svelte'
  import PapaParse from 'papaparse'
  import { Accordion, Loader, Checkbox } from '@undp-data/svelte-undp-design'
  import { clean, downloadFile, getActiveBandIndex, getLayerStyle, getValueFromRasterTileUrl } from '$lib/helper'
  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import Notification from './controls/Notification.svelte'

  interface PointFeature {
    type: 'Feature'
    geometry: {
      type: 'Point'
      coordinates: [number, number]
    }
    id: string
    properties: { [key: string]: string | number }
  }

  export let map: Map
  let popup: Popup | undefined
  let popupContainer: HTMLDivElement
  let isActive = false
  let isValuesRounded = true

  let features: PointFeature[] = []
  let coordinates: number[]
  let showProgress = false

  // eslint-disable-next-line
  function MapQueryInfoControl() {}

  MapQueryInfoControl.prototype.onAdd = function () {
    // this.map = map
    this.container = document.createElement('div')
    this.container.title = 'Query Layer Information'
    this.container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group')

    this.button = document.createElement('button')
    this.button.classList.add('mapboxgl-query-info-control')
    this.button.type = 'button'
    this.button.addEventListener('click', () => {
      this.changeButtonCondition()
    })
    this.container.appendChild(this.button)
    this.button.dispatchEvent(new Event('click'))
    return this.container
  }

  MapQueryInfoControl.prototype.changeButtonCondition = function () {
    if (isActive) {
      map.off('click', this.onClick.bind(this))
      map.getCanvas().style.cursor = ''
      isActive = false
    } else {
      map.on('click', this.onClick.bind(this))
      map.getCanvas().style.cursor = 'crosshair'
      isActive = true
    }
  }

  MapQueryInfoControl.prototype.onClick = async (e: MapMouseEvent) => {
    if (!isActive) return
    const visibleLayers = map.getStyle().layers.filter((l) => {
      let visibility = 'visible'
      if (l.layout && l.layout.visibility) {
        visibility = l.layout.visibility
      }
      return visibility === 'visible'
    })
    const visibleLayerIds = visibleLayers.map((l) => l.id)
    const layersVisible = $layerList.filter((layer) => visibleLayerIds.includes(layer.id))
    if (layersVisible.length === 0) {
      if (popup) {
        popup.remove()
        popup = undefined
      }
      return
    }

    const lat = e.lngLat.lat
    const lng = e.lngLat.lng

    features = []
    expanded = {}
    coordinates = []

    const promises = []

    for (const layer of $layerList) {
      const layerStyle = getLayerStyle(map, layer.id)
      if (layerStyle.type === 'raster') {
        const rasterInfo = layer.info as RasterTileMetadata
        if (rasterInfo?.isMosaicJson) {
          promises.push(queryMosaicJson(lng, lat, layer))
        } else {
          promises.push(queryCOG(lng, lat, layer))
        }
      } else {
        promises.push(queryVectorData(lng, lat, e.point, layer))
      }
    }

    if (popup) {
      popup.remove()
      popup = undefined
    }
    popup = new Popup().setLngLat(e.lngLat).setDOMContent(popupContainer).setMaxWidth('300px').addTo(map)

    coordinates = [e.lngLat.lng, e.lngLat.lat]

    showProgress = true
    map.getCanvas().style.cursor = 'wait'
    Promise.all(promises)
      .then((queriedFeautres: PointFeature[]) => {
        features = queriedFeautres.filter(
          (f) => f && Object.keys(f.properties).filter((key) => key !== 'name').length > 0,
        )

        if (features.length === 0) {
          if (popup) {
            popup.remove()
            popup = undefined
          }
        } else {
          features.forEach((feature, index) => {
            expanded[feature.id] = index === 0
            if (index === 0) {
              expandedLayerId = feature.id as string
            }
          })
        }
      })
      .finally(() => {
        showProgress = false
        map.getCanvas().style.cursor = 'crosshair'
      })
  }

  MapQueryInfoControl.prototype.onRemove = function () {
    if (!this.container || !this.container.parentNode) {
      return
    }
    this.container.parentNode.removeChild(this.container)
  }

  /*global MapQueryInfoControl */
  /*eslint no-undef: "error"*/
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  let mapQueryInfoControl: MapQueryInfoControl = null

  $: {
    if (map) {
      if (mapQueryInfoControl !== null && map.hasControl(mapQueryInfoControl) === false) {
        map.addControl(mapQueryInfoControl, 'top-right')
      }
    }
  }

  onMount(async () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    mapQueryInfoControl = new MapQueryInfoControl()
  })

  onDestroy(() => {
    if (map) {
      if (mapQueryInfoControl && map.hasControl(mapQueryInfoControl)) {
        map.removeControl(mapQueryInfoControl)
      }
    }
  })

  let expanded: { [key: string]: boolean } = {}
  let expandedLayerId: string
  $: {
    let expandedLayers = Object.keys(expanded).filter((key) => expanded[key] === true && key !== expandedLayerId)
    if (expandedLayers.length > 0) {
      expandedLayerId = expandedLayers[0]
      Object.keys(expanded)
        .filter((key) => key !== expandedLayerId)
        .forEach((key) => {
          expanded[key] = false
        })
      expanded[expandedLayers[0]] = true
    }
  }

  const createFeature = (lng: number, lat: number, id: string, properties: { [key: string]: string | number }) => {
    const feature: PointFeature = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lng, lat],
      },
      id: id,
      properties: properties,
    }
    return feature
  }

  const queryVectorData = async (lng: number, lat: number, point: PointLike, layer: Layer) => {
    const props: { [key: string]: string | number } = {
      name: layer.name,
    }

    const queriedFeatures = map.queryRenderedFeatures(point, {
      layers: [layer.id],
    })
    if (queriedFeatures && queriedFeatures.length > 0) {
      Object.keys(queriedFeatures[0].properties).forEach((key) => {
        props[key] = queriedFeatures[0].properties[key]
      })
    } else {
      return
    }

    return createFeature(lng, lat, layer.id, props)
  }

  const queryCOG = async (lng: number, lat: number, layer: Layer) => {
    const rasterInfo = layer.info as RasterTileMetadata
    const bandIndex = getActiveBandIndex(layer.info)
    const baseUrl = `${PUBLIC_TITILER_ENDPOINT}/point/${lng},${lat}?url=${getValueFromRasterTileUrl(
      map,
      layer.id,
      'url',
    )}&bidx=${bandIndex + 1}`
    const expression = getValueFromRasterTileUrl(map, layer.id, 'expression') as string
    const queryURL = !expression ? baseUrl : `${baseUrl}&expression=${encodeURIComponent(expression)}`

    const res = await fetch(queryURL)
    const data = await res.json()

    let layerHasNoDataValue = false
    for (const value of data.values) {
      if (value === rasterInfo.nodata_value) layerHasNoDataValue = true
    }
    if (layerHasNoDataValue) {
      return
    }

    const layerUniqueValues = rasterInfo.band_metadata[bandIndex][1].STATISTICS_UNIQUE_VALUES

    const props: { [key: string]: string | number } = {
      name: layer.name,
    }

    data.values.forEach((value) => {
      if (layerUniqueValues) {
        const key = layerUniqueValues[value]
        props[key ? key : `Band=${rasterInfo.active_band_no}`] = value
      } else {
        props[`Band=${rasterInfo.active_band_no}`] = value
      }
    })

    return createFeature(lng, lat, layer.id, props)
  }

  const queryMosaicJson = async (lng: number, lat: number, layer: Layer) => {
    const rasterInfo = layer.info as RasterTileMetadata

    const baseUrl = `${PUBLIC_TITILER_ENDPOINT.replace(
      'cog',
      'mosaicjson',
    )}/point/${lng},${lat}?url=${getValueFromRasterTileUrl(map, layer.id, 'url')}`
    const res = await fetch(baseUrl)
    const data = await res.json()
    if (!(data.values.length > 0 && data.values[0].length > 0 && data.values[0][1].length > 0)) {
      return
    }

    const bandIndex = getActiveBandIndex(rasterInfo)
    const value = `${data.values[0][1]}`
    const values: number[] = value.split(',').map((v) => Number(v))
    const layerUniqueValues = rasterInfo.band_metadata[bandIndex][1].STATISTICS_UNIQUE_VALUES

    const props: { [key: string]: string | number } = {
      name: layer.name,
    }

    for (const v of values) {
      if (layerUniqueValues) {
        const key = layerUniqueValues[v]
        props[key ? key : `Band=${values.indexOf(v) + 1}`] = v
      } else {
        props[`Band=${values.indexOf(v) + 1}`] = v
      }
    }

    return createFeature(lng, lat, layer.id, props)
  }

  const formatValue = (value: number | string) => {
    if (Number.isFinite(value) && isValuesRounded) {
      const val = value as number
      return (Math.round((val + Number.EPSILON) * 100) / 100).toFixed(2)
    } else {
      return value
    }
  }

  const downloadCsv = () => {
    const data = [
      ['UNDP : GeoHub : Query Information'],
      [new Date().toISOString()],
      [],
      ['ID', 'Layer name', 'Longitude', 'Latitude', 'Property', 'Value'],
    ]

    features.forEach((feature) => {
      Object.keys(feature.properties).forEach((key) => {
        if (key === 'name') return
        data.push([
          feature.id,
          `${feature.properties.name}`,
          `${feature.geometry.coordinates[0]}`,
          `${feature.geometry.coordinates[1]}`,
          key,
          `${feature.properties[key]}`,
        ])
      })
    })

    const filename = `undp-geohub-layers-data-${new Date().toISOString().split('T')[0]}.csv`
    let csvContent = null

    if (typeof data === 'object') {
      csvContent = PapaParse.unparse(data, { header: false })
    } else {
      csvContent = data
    }

    downloadFile(filename, csvContent)
  }

  const downloadGeoJson = () => {
    const fc = {
      type: 'FeatureCollection',
      features: features,
    }
    const data = JSON.stringify(fc)
    const filename = `undp-geohub-layers-data-${new Date().toISOString().split('T')[0]}.geojson`
    downloadFile(filename, data)
  }
</script>

<div
  bind:this={popupContainer}
  class="popup-container">
  <div class="container is-fullhd">
    <div class="notification p-2 m-0 mb-2">
      <b>Query information</b>
    </div>
  </div>
  <div class="contents">
    {#if showProgress}
      <div class="loader-container">
        <Loader />
      </div>
    {:else}
      <Notification type="info">{`${features.length} layer${features.length > 1 ? 's' : ''} found.`}</Notification>
      {#if coordinates && coordinates.length === 2}
        <table class="attr-table table is-striped is-narrow is-hoverable s-fullwidth">
          <thead>
            <tr>
              <th>Longitude</th>
              <th>Latitude</th>
            </tr>
          </thead>
          <tbody>
            {#key coordinates}
              <tr>
                <td>{coordinates[0]}</td>
                <td>{coordinates[1]}</td>
              </tr>
            {/key}
          </tbody>
        </table>
      {/if}
      {#each features as feature}
        <Accordion
          headerTitle={`${feature.properties.name}`}
          bind:isExpanded={expanded[feature.id]}>
          <div
            slot="content"
            class="accordion-content px-1">
            <table class="attr-table table is-striped is-narrow is-hoverable s-fullwidth">
              <thead>
                <tr>
                  <th>Property</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                {#key isValuesRounded}
                  {#each Object.keys(feature.properties) as property}
                    {#if property !== 'name'}
                      <tr>
                        <td>{clean(property)}</td>
                        <td>{formatValue(feature.properties[property])}</td>
                      </tr>
                    {/if}
                  {/each}
                {/key}
              </tbody>
            </table>
          </div>
        </Accordion>
      {/each}
    {/if}
  </div>

  <div class="is-divider p-0 m-0 py-2" />
  <div class="container actions">
    <Checkbox
      label="Round values"
      bind:checked={isValuesRounded} />
    <div
      class="download"
      hidden={!(features && features.length > 0)}>
      <button
        class="button is-small download"
        on:click={() => downloadGeoJson()}
        title="Download GeoJSON">
        <span class="icon is-small pointer">
          <i class="fa-solid fa-download fa-lg" />
        </span>
        <span class="label">GeoJSON</span>
      </button>
    </div>

    <div
      class="download"
      hidden={!(features && features.length > 0)}>
      <button
        class="button is-small download"
        on:click={() => downloadCsv()}
        title="Download CSV">
        <span class="icon is-small pointer">
          <i class="fa-solid fa-download fa-lg" />
        </span>
        <span class="label">CSV</span>
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .popup-container {
    height: fit-content;

    :global(.notification) {
      margin: 0;
    }

    .contents {
      max-height: 400px;
      overflow-y: auto;
    }

    .attr-table {
      width: 100%;
      margin: 0;
    }

    .loader-container {
      width: max-content;
      margin: auto;
      background-color: white;
    }

    .actions {
      display: flex;
      width: 450px;

      .download {
        margin-right: 5px;
        width: 85px;

        .pointer {
          cursor: pointer;
        }

        .label {
          font-size: 11px;
          font-weight: normal;
          margin-left: 5px;
        }
      }
    }
  }

  :global(.mapboxgl-query-info-control) {
    background-position: center !important;
    background-repeat: no-repeat !important;
    background-size: 75% !important;
    background: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"/></svg>');
  }
  :global(.maplibregl-popup-close-button) {
    top: 15px !important;
    right: 10px !important;
    height: 30px;
    width: 30px;
  }
</style>
