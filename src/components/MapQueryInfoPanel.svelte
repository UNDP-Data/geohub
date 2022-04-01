<script lang="ts">
  import { onMount } from 'svelte'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck'
  import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare'
  import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons/faUpDownLeftRight'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import GeoJSON from 'geojson'
  import maplibregl, { Map, MapMouseEvent, Marker, TriangleIndexArray } from 'maplibre-gl'
  import Moveable from 'moveable'
  import PapaParse from 'papaparse'
  import Fa from 'svelte-fa'

  import { layerList, map } from '../stores'
  import type { Layer } from '../lib/types'
  import { LayerTypes } from '$lib/constants'

  export let mapMouseEvent: MapMouseEvent

  let isDataContainerVisible = false
  let isValuesRounded = true
  let layerValuesData = []
  let mapQueryInfoControl = null
  let marker: Marker

  const iconSize = 'lg'
  const frame = { translate: [0, 0] }

  // layer change
  $: {
    const layersVisible = $layerList.filter((layer) => layer.visible === true)

    if ($map !== null) {
      if (layersVisible.length > 0) {
        if ($map.hasControl(mapQueryInfoControl) === false) {
          $map.addControl(mapQueryInfoControl, 'top-right')
        }
      } else {
        mapMouseEvent = null
        if (mapQueryInfoControl) $map.removeControl(mapQueryInfoControl)
        resetMapQueryInfo()
      }
    }
  }

  // mouse click on map
  $: {
    if (mapMouseEvent?.lngLat && isDataContainerVisible === true) {
      const layersVisible = $layerList.filter((layer) => layer.visible === true)

      if (layersVisible.length > 0) {
        removeMapLayerValues(false)
        addMapLayerValues(layersVisible)
      }
    }
  }

  const resetMapQueryInfo = () => {
    if (marker) marker.remove()
    mapMouseEvent = null
    isDataContainerVisible = false
    layerValuesData = []
    if ($map) $map.getCanvas().style.cursor = 'grab'
  }

  const removeMapLayerValues = (hideCoordinates = true) => {
    $map.getCanvas().style.cursor = ''

    if (hideCoordinates) isDataContainerVisible = false
    if (marker) marker.remove()
  }

  const addMapLayerValues = async (layersVisible: Layer[]) => {
    $map.getCanvas().style.cursor = 'crosshair'
    marker = new maplibregl.Marker().setLngLat(mapMouseEvent.lngLat).addTo($map)

    // get layer value(s) at lat/lng of mouse event
    const titilerApiUrl = import.meta.env.VITE_TITILER_ENDPOINT
    const lat = mapMouseEvent.lngLat?.lat
    const lng = mapMouseEvent.lngLat?.lng
    let layerValuesDataTmp = []

    for (const layer of layersVisible) {
      let values = []
      if (layer.type === LayerTypes.RASTER) {
        const layerData = await fetch(`${titilerApiUrl}/point/${lng},${lat}?url=${layer.url}`).then((res) => {
          return res.json()
        })

        // check for no data value
        let layerHasNoDataValue = false

        if (Object.prototype.hasOwnProperty.call(layerData, 'detail')) layerHasNoDataValue = true

        if (layerHasNoDataValue === false) {
          for (const value of layerData.values) {
            if (value === layer.info.nodata_value) layerHasNoDataValue = true
          }
        }

        values = layerHasNoDataValue ? null : layerData.values
      }

      layerValuesDataTmp = [...[{ name: layer.name, lat, lng, values }], ...layerValuesDataTmp]
    }

    layerValuesData = layerValuesDataTmp
    isDataContainerVisible = true
  }

  const downloadCsv = () => {
    const data = [
      ['UNDP : GeoHub : Query Information'],
      [new Date().toISOString()],
      [],
      ['Latitude', 'Longitude'],
      [mapMouseEvent.lngLat?.lat, mapMouseEvent.lngLat?.lng],
      [],
      ['Layer Name', 'Values'],
    ]

    layerValuesData.forEach((layerValue) => {
      data.push([layerValue.name, layerValue.values])
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
    const data = JSON.stringify(GeoJSON.parse(layerValuesData, { Point: ['lat', 'lng'] }))
    const filename = `undp-geohub-layers-data-${new Date().toISOString().split('T')[0]}.geojson`
    downloadFile(filename, data)
  }

  const downloadFile = (filename: string, content: string) => {
    const bomCode = '\ufeff'
    const data = new Blob([`${bomCode}${content}`], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${filename}`)
    link.click()
    link.remove()
  }

  // eslint-disable-next-line
  function MapQueryInfoControl() {}

  MapQueryInfoControl.prototype.onAdd = function (map: Map) {
    this.map = map
    this.container = document.createElement('div')
    this.container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group')

    this.queryInfoContainer = document.createElement('div')
    this.queryInfoContainer.classList.add('mapboxgl-query-info-list')
    this.container.appendChild(this.queryInfoContainer)

    this.button = document.createElement('button')
    this.button.classList.add('mapboxgl-ctrl-icon', 'mapboxgl-query-info-control')
    this.button.type = 'button'
    this.button.addEventListener('click', () => {
      if (isDataContainerVisible === false) {
        map.getCanvas().style.cursor = 'crosshair'
        isDataContainerVisible = true
      } else {
        resetMapQueryInfo()
      }
    })
    this.container.appendChild(this.button)

    return this.container
  }

  MapQueryInfoControl.prototype.onRemove = function () {
    if (!this.container || !this.container.parentNode || !this.map || !this.button) {
      return
    }
    this.container.parentNode.removeChild(this.container)
    this.map = undefined
  }

  onMount(async () => {
    mapQueryInfoControl = new MapQueryInfoControl()

    new Moveable(document.body, {
      className: 'moveable-control',
      draggable: true,
      dragTarget: document.getElementById('header'),
      edgeDraggable: true,
      hideDefaultLines: true,
      origin: false,
      resizable: true,
      target: document.getElementById('data-container'),
      throttleDrag: 0,
      throttleResize: 0,
    })
      .on('dragStart', (e) => {
        e.set(frame.translate)
      })
      .on('drag', (e) => {
        frame.translate = e.beforeTranslate
        e.target.style.transform = `translate(${e.beforeTranslate[0]}px, ${e.beforeTranslate[1]}px)`
      })
      .on('resizeStart', (e) => {
        e.setOrigin(['%', '%'])
        const style = window.getComputedStyle(e.target)
        const cssWidth = parseFloat(style.width)
        const cssHeight = parseFloat(style.height)
        e.set([cssWidth, cssHeight])
      })
      .on('resize', (e) => {
        e.target.style.width = `${e.width}px`
        e.target.style.height = `${e.height}px`
        frame.translate = e.drag.beforeTranslate
        e.target.style.transform = `translate(${e.drag.beforeTranslate[0]}px, ${e.drag.beforeTranslate[1]}px)`
      })
  })
</script>

<div id="data-container" class="data-container target" hidden={!isDataContainerVisible}>
  <div id="header" class="header">
    <div class="name">Query Information</div>

    <div class="handle" alt="Move Query Information" title="Move Query Information">
      <span class="icon is-small pointer">
        <Fa icon={faUpDownLeftRight} size={iconSize} />
      </span>
    </div>

    <div
      class="close"
      alt="Close Query Information"
      title="Close Query Information"
      on:click={() => resetMapQueryInfo()}>
      <span class="icon is-small pointer">
        <Fa icon={faXmark} size={iconSize} />
      </span>
    </div>
  </div>

  <div class="container-expand-collapse">
    <div class="content">
      <table class="table is-fullwidth coordinates">
        <thead>
          <tr>
            <th>Latitude</th>
            <th>Longitude</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="first-column">{mapMouseEvent?.lngLat?.lat ? mapMouseEvent?.lngLat?.lat : 'N/A'}</td>
            <td class="second-column">{mapMouseEvent?.lngLat?.lng ? mapMouseEvent?.lngLat?.lng : 'N/A'}</td>
          </tr>
        </tbody>
      </table>

      <table class="table is-fullwidth is-striped data-values">
        <thead>
          <tr>
            <th>Layer Name</th>
            <th>Values</th>
          </tr>
        </thead>
        <tbody>
          {#if layerValuesData.length > 0}
            {#each layerValuesData as layerValue}
              <tr>
                <td class="first-column">{layerValue.name}</td>

                {#if layerValue.values === null}
                  <td class="second-column"> N/A </td>
                {:else if isValuesRounded === true}
                  <td class="second-column">
                    {layerValue.values
                      .map((val) => (Math.round((val + Number.EPSILON) * 100) / 100).toFixed(2))
                      .join(', ')}
                  </td>
                {:else}
                  <td class="second-column">
                    {layerValue.values.join(', ')}
                  </td>
                {/if}
              </tr>
            {/each}
          {:else}
            <tr>
              <td class="first-column">N/A</td>
              <td class="second-column">N/A</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>

    {#if layerValuesData.length > 0}
      <div class="actions">
        <div class="rounded-values" on:click={() => (isValuesRounded = !isValuesRounded)}>
          <div class="icon is-small">
            <Fa icon={isValuesRounded ? faSquareCheck : faSquare} size="1x" />
          </div>
          <div>Round values</div>
        </div>

        <div class="download">
          <button
            class="button is-small download"
            on:click={() => downloadGeoJson()}
            alt="Download GeoJSON"
            title="Download GeoJSON">
            <span class="icon is-small pointer">
              <Fa icon={faDownload} size={iconSize} />
            </span>
            <span class="label">GeoJSON</span>
          </button>
        </div>

        <div class="download">
          <button
            class="button is-small download"
            on:click={() => downloadCsv()}
            alt="Download CSV"
            title="Download CSV">
            <span class="icon is-small pointer">
              <Fa icon={faDownload} size={iconSize} />
            </span>
            <span class="label">CSV</span>
          </button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  :global(.moveable-control) {
    position: absolute;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 0 !important;
    box-sizing: none !important;
    background: none !important ;
    margin-top: -7px;
    margin-left: -7px;
    z-index: 10;
  }

  .data-container {
    background-color: #f9f9f9;
    border-radius: 10px;
    border: 1px solid #ccc;
    bottom: 50px;
    box-shadow: 5px 5px 5px rgba(0, 0, 0, 0.2);
    font-family: ProximaNova, sans-serif;
    font-size: 11px;
    left: 10px;
    min-height: 250px;
    min-width: 300px;
    padding: 10px;
    position: absolute;
    width: 325px;

    .header {
      align-items: right;
      background: #f0f0f0;
      border-radius: 7.5px;
      cursor: grab;
      display: flex;
      gap: 7.5px;
      justify-content: flex-end;
      padding-left: 7.5px;
      padding-top: 5px;

      .name {
        cursor: pointer;
        font-size: 13px;
        margin-right: auto;
        padding-bottom: 2px;
      }

      .handle,
      .close {
        cursor: pointer;
        padding-top: 2px;
        width: 20px;
      }

      .handle {
        cursor: grab;
      }
    }

    .content {
      margin-top: 15px;
      margin-bottom: 15px;

      table {
        background-color: #f9f9f9;
      }

      .coordinates {
        margin: 0;
      }

      .data-values {
        margin-bottom: 10px;
      }
      .first-column {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 200px;
      }
      .second-column {
        overflow: hidden;
        text-align: right;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 125px;
      }
    }

    .actions {
      display: flex;
      align-items: left;
      justify-content: flex-end;

      .rounded-values {
        align-items: left;
        display: flex;
        gap: 4px;
        margin-left: 6px;
        margin-right: auto;
        margin-top: 5px;
        width: 110px;
      }

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
    background: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"/></svg>');
    background-position: center;
    background-repeat: no-repeat;
    background-size: 70%;
  }
</style>
