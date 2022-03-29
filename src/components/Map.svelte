<script lang="ts">
  import { onMount } from 'svelte'
  import { draggable } from '@neodrag/svelte'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck'
  import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare'
  import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons/faUpDownLeftRight'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import maplibregl, { Map, MapMouseEvent, Marker } from 'maplibre-gl'
  import PapaParse from 'papaparse'
  import Fa from 'svelte-fa'

  import '@watergis/maplibre-gl-export/css/styles.css'
  import { indicatorProgress, map } from '../stores'
  import { layerList } from '../stores'
  import type { Layer } from '../lib/types'

  const iconSize = 'lg'

  let container: HTMLDivElement
  let mapMouseEvent: MapMouseEvent
  let marker: Marker
  let layerValuesData = []
  let dataContainerStyle = 'none'
  let isValuesRounded = true

  // $map.addControl(exportControl, 'top-right')
  // $map.removeControl(exportControl)

  // if map has been clicked, set values array when layer list updated
  $: {
    if (mapMouseEvent?.lngLat) {
      const layersWithQueryInfo = $layerList.filter((layer) => layer.queryInfoEnabled == true)
      if (layersWithQueryInfo.length > 0) {
        removeMapLayerValues(false)
        addMapLayerValues(layersWithQueryInfo)
      } else {
        removeMapLayerValues()
      }
    }
  }

  onMount(async () => {
    const newMap = new Map({
      container,
      style: 'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [0, 0],
      zoom: 3,
      hash: true,
    })

    newMap.on('click', async function (e: MapMouseEvent) {
      mapMouseEvent = e
    })

    newMap.addControl(new maplibregl.NavigationControl({}), 'top-right')
    newMap.addControl(new maplibregl.ScaleControl({}), 'bottom-left')

    const { MaplibreExportControl, Size, PageOrientation, Format, DPI } = await import('@watergis/maplibre-gl-export')
    const exportControl = new MaplibreExportControl({
      PageSize: Size.A4,
      PageOrientation: PageOrientation.Landscape,
      Format: Format.PNG,
      DPI: DPI[96],
      Crosshair: true,
      PrintableArea: true,
    })

    newMap.addControl(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      exportControl,
      'top-right',
    )

    const indicatorProgressEvents = {
      true: ['zoomstart', 'touchmove', 'mousedown'],
      false: ['zoomend', 'touchend', 'mouseup'],
    }

    Object.keys(indicatorProgressEvents).forEach((state) => {
      indicatorProgressEvents[state].forEach((event: any) => {
        newMap.on(event, () => {
          $indicatorProgress = state === 'true'
        })
      })
    })

    map.update(() => newMap)
  })

  const removeMapLayerValues = (hideCoordinates = true) => {
    if (marker) {
      if (hideCoordinates) dataContainerStyle = 'none'
      marker.remove()
    }
  }

  const addMapLayerValues = async (layersWithQueryInfo: Layer[]) => {
    marker = new maplibregl.Marker().setLngLat(mapMouseEvent.lngLat).addTo($map)

    // get layer value(s) at lat/lng of mouse event
    const titilerApiUrl = import.meta.env.VITE_TITILER_ENDPOINT
    const lat = mapMouseEvent.lngLat.lat
    const lng = mapMouseEvent.lngLat.lng
    let layerValuesDataTmp = []

    for (const layer of layersWithQueryInfo) {
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

      layerValuesDataTmp = [
        ...[
          {
            name: layer.name,
            lat,
            lng,
            values: layerHasNoDataValue ? null : layerData.values,
          },
        ],
        ...layerValuesDataTmp,
      ]
    }

    layerValuesData = layerValuesDataTmp
    dataContainerStyle = 'block'
  }

  const downloadCsv = () => {
    const data = [
      ['UNDP : GeoHub : Layer Export'],
      [new Date().toISOString()],
      [],
      ['Latitude', 'Longitude'],
      [mapMouseEvent.lngLat.lat, mapMouseEvent.lngLat.lng],
      [],
      ['Layer Name', 'Values'],
    ]

    layerValuesData.forEach((layerValue) => {
      data.push([layerValue.name, layerValue.values])
    })

    const filename = `undp-geohub-layers-data-${new Date().toISOString().split('T')[0]}`
    const bomCode = '\ufeff'
    let csvContent = null

    if (typeof data === 'object') {
      csvContent = PapaParse.unparse(data, { header: false })
    } else {
      csvContent = data
    }

    const csvData = new Blob([`${bomCode}${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const csvURL = window.URL.createObjectURL(csvData)
    const link = document.createElement('a')
    link.href = csvURL
    link.setAttribute('download', `${filename}.csv`)
    link.click()
    link.remove()
  }
</script>

<svelte:head>
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@2.1.1/dist/maplibre-gl.css" />
</svelte:head>

<div bind:this={container} class="map">
  {#if map}
    <slot />
  {/if}
</div>

<div class="data-container" style={`display: ${dataContainerStyle};`} use:draggable={{ handle: '.handle' }}>
  <div class="header">
    <div class="handle" alt="Move" title="Move">
      <span class="icon is-small pointer">
        <Fa icon={faUpDownLeftRight} size={iconSize} />
      </span>
    </div>
    <div class="close" alt="Close" title="Close" on:click={() => (dataContainerStyle = 'none')}>
      <span class="icon is-small pointer">
        <Fa icon={faXmark} size={iconSize} />
      </span>
    </div>
  </div>

  <div class="content">
    {#if mapMouseEvent?.lngLat}
      <table class="table is-fullwidth coordinates">
        <thead>
          <tr>
            <th>Latitude</th>
            <th>Longitude</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="first-column">{mapMouseEvent.lngLat.lat}</td>
            <td class="second-column">{mapMouseEvent.lngLat.lng}</td>
          </tr>
        </tbody>
      </table>
    {/if}

    <table class="table is-fullwidth is-striped data-values">
      <thead>
        <tr>
          <th>Layer Name</th>
          <th>Values</th>
        </tr>
      </thead>
      <tbody>
        {#each layerValuesData as layerValue}
          <tr>
            <td class="first-column">{layerValue.name}</td>

            {#if layerValue.values === null}
              <td class="second-column"> N/A </td>
            {:else if isValuesRounded === true}
              <td class="second-column">
                {layerValue.values.map((val) => (Math.round((val + Number.EPSILON) * 100) / 100).toFixed(2)).join(', ')}
              </td>
            {:else}
              <td class="second-column">
                {layerValue.values.join(', ')}
              </td>
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <div class="actions">
    <div class="rounded-values" on:click={() => (isValuesRounded = !isValuesRounded)}>
      <div class="icon is-small">
        <Fa icon={isValuesRounded ? faSquareCheck : faSquare} size="1x" />
      </div>
      <div>Round values</div>
    </div>
    <div class="download">
      <button class="button is-small download" on:click={() => downloadCsv()} alt="Download CSV" title="Download CSV">
        <span class="icon is-small pointer">
          <Fa icon={faDownload} size={iconSize} />
        </span>
        <span class="label">CSV</span>
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  .map {
    height: 100%;
    width: 100%;
  }

  .data-container {
    font-family: ProximaNova, sans-serif;
    font-size: 11px;
    background-color: white;
    opacity: 0.8;
    position: absolute;
    bottom: 50px;
    left: 10px;
    padding: 10px;
    border-radius: 10px;
    display: none;

    .header {
      display: flex;
      align-items: right;
      justify-content: flex-end;
      gap: 7.5px;

      > div {
        width: 20px;
        cursor: pointer;
      }
    }

    .content {
      margin-top: 10px;
      margin-bottom: 15px;

      .coordinates {
        margin: 0;
      }

      .data-values {
        margin-bottom: 10px;
      }
      .first-column {
        width: 200px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .second-column {
        width: 125px;
        text-align: right;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .actions {
      display: flex;
      align-items: left;
      justify-content: flex-end;

      .rounded-values {
        width: 110px;
        display: flex;
        align-items: left;
        gap: 4px;
        margin-right: auto;
        margin-top: 5px;
        margin-left: 6px;
      }

      .download {
        .pointer {
          cursor: pointer;
        }
        .label {
          margin-right: 5px;
          font-size: 11px;
          font-weight: normal;
          text-align: right;
        }
      }
    }
  }
</style>
