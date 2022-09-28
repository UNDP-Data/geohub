<script lang="ts">
  import { onMount } from 'svelte'
  import GeoJSON from 'geojson'
  import maplibregl, { Map, MapMouseEvent, Marker } from 'maplibre-gl'
  import Moveable from 'moveable'
  import PapaParse from 'papaparse'
  import Fa from 'svelte-fa'
  import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
  import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck'
  import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare'
  import { faUpDownLeftRight } from '@fortawesome/free-solid-svg-icons/faUpDownLeftRight'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'

  import { layerList, map } from '$stores'
  import type { Layer } from '$lib/types'
  import { LayerIconTypes, LayerTypes } from '$lib/constants'
  import { downloadFile, fetchUrl, getActiveBandIndex } from '$lib/helper'

  export let mapMouseEvent: MapMouseEvent
  export let isDataContainerVisible: boolean
  // let isDataContainerVisible = false
  let isValuesRounded = true
  let layerValuesData = []
  let marker: Marker

  const iconSize = 'lg'
  const noDataLabel = 'N/A'
  const frame = { translate: [0, 0] }

  // $:{
  //   if(mapMouseEvent){
  //     marker = new maplibregl.Marker().setLngLat(mapMouseEvent.lngLat).addTo($map)
  //   }
  // }
  // layer change
  // $: {
  //   const layersVisible = $layerList.filter((layer) => layer.visible === true)
  //   layerValuesExpanded = []
  //
  //   if ($map !== null) {
  //     if (layersVisible.length > 0) {
  //       if (mapQueryInfoControl !== null && $map.hasControl(mapQueryInfoControl) === false) {
  //         $map.addControl(mapQueryInfoControl, 'top-right')
  //       }
  //     } else {
  //       mapMouseEvent = null
  //       if (mapQueryInfoControl) $map.removeControl(mapQueryInfoControl)
  //       resetMapQueryInfo()
  //     }
  //   }
  // }

  // mouse click on map
  $: {
    if (mapMouseEvent?.lngLat) {
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
      let presentUniqueNames = {}
      let availableUnique = {}
      let bandIndex: number = null
      if (layer.type === LayerTypes.RASTER) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        bandIndex = getActiveBandIndex(layer.info)
        const baseUrl = `${titilerApiUrl}/point/${lng},${lat}?url=${layer.url}&bidx=${bandIndex + 1}`
        const queryURL = !layer.expression ? baseUrl : `${baseUrl}&expression=${encodeURIComponent(layer.expression)}`

        const layerData = await fetchUrl(queryURL)
        const layerUniqueValues = layer.info.band_metadata[bandIndex][1].STATISTICS_UNIQUE_VALUES

        let layerHasNoDataValue = false

        if (Object.prototype.hasOwnProperty.call(layerData, 'detail')) layerHasNoDataValue = true

        if (layerHasNoDataValue === false) {
          for (const value of layerData.values) {
            if (value === layer.info.nodata_value) layerHasNoDataValue = true
          }
        }

        values = layerHasNoDataValue ? [] : layerData.values
        presentUniqueNames = values.map((item) => {
          return (presentUniqueNames[String(item)] = layerUniqueValues[item])
        })
      } else if (layer.type === LayerTypes.VECTOR) {
        const layerClicked = $layerList.find((layerList) => layerList.definition.id === layer.definition.id)
        if (layerClicked.features) {
          values = layer.features
        }
      }
      layerValuesDataTmp = [
        ...[
          {
            id: layer.definition.id,
            name: layer.name,
            lat,
            lng,
            type: layer.type,
            values,
            // legend labels should correspond to the actual values in the values array
            legendLabels: presentUniqueNames,
          },
        ],
        ...layerValuesDataTmp,
      ]
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
      ['Layer Name', 'Layer Type', 'Property', 'Value'],
    ]

    layerValuesData.forEach((layerValue) => {
      if (layerValue.type === LayerTypes.RASTER) {
        data.push([
          layerValue.name,
          layerValue.type,
          '',
          layerValue.values.length > 0 ? layerValue.values : noDataLabel,
        ])
      } else if (layerValue.type === LayerTypes.VECTOR) {
        if (layerValue.values.length === 0) {
          data.push([layerValue.name, layerValue.type, 'N/A', 'N/A'])
        } else {
          Object.keys(layerValue.values).forEach((key) => {
            data.push([layerValue.name, layerValue.type, key, layerValue.values[key]])
          })
        }
      }
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore:next-line
    const data = JSON.stringify(GeoJSON.parse(layerValuesData, { Point: ['lat', 'lng'] }))
    const filename = `undp-geohub-layers-data-${new Date().toISOString().split('T')[0]}.geojson`
    downloadFile(filename, data)
  }

  onMount(async () => {
    new Moveable(document.body, {
      className: 'moveable-control',
      draggable: true,
      dragTarget: document.querySelector('#header'),
      edgeDraggable: false,
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

  let layerValuesExpanded = []
</script>

<div id="data-container" class="data-container target" hidden={isDataContainerVisible === false}>
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
            <td class="first-column">{mapMouseEvent?.lngLat?.lat ? mapMouseEvent?.lngLat?.lat : noDataLabel}</td>
            <td class="second-column">{mapMouseEvent?.lngLat?.lng ? mapMouseEvent?.lngLat?.lng : noDataLabel}</td>
          </tr>
        </tbody>
      </table>

      <table class="table is-fullwidth is-striped">
        <thead>
          <tr>
            <th>Layer Name</th>
            <th>Pixel Values</th>
            <th>Label</th>
          </tr>
        </thead>
        <tbody>
          {#each layerValuesData as layerValue, i (layerValue)}
            {@const layerIconType = LayerIconTypes.find((iconType) => iconType.id === layerValue.type)}
            {@const layerIconTypeLabel = `${layerIconType.label} Layer`}
            <tr style={layerValuesExpanded[i] === true ? 'border-top: 0;' : ''}>
              <td class="first-column">
                <div class="icon" alt={layerIconTypeLabel} title={layerIconTypeLabel}>
                  <Fa icon={layerIconType.icon} size="sm" primaryColor={layerIconType.color} />&nbsp;
                </div>
                <div class="name">
                  {layerValue.name}
                </div>
              </td>
              {#if (layerValue.values && layerValue.values.length === 0) || (layerValue.legendLabels && layerValue.legendLabels.length === 0 && (layerValue.type === LayerTypes.RASTER || layerValue.type === LayerTypes.VECTOR))}
                <td class="second-column"> N/A </td>
                <td class="third-column"> N/A </td>
              {:else if layerValue.type === LayerTypes.RASTER}
                {#if isValuesRounded === true}
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
                {#if layerValue.legendLabels.length > 0}
                  <td class="third-column">
                    {layerValue.legendLabels}
                  </td>
                {:else}
                  <td class="third-column"> N/A </td>
                {/if}
              {:else if layerValue.type === LayerTypes.VECTOR}
                <td class="second-column">
                  <div class="expand-collapse" on:click={() => (layerValuesExpanded[i] = !layerValuesExpanded[i])}>
                    {#if layerValuesExpanded[i] === undefined || layerValuesExpanded[i] === false}
                      <Fa icon={faChevronDown} size="sm" />
                    {:else}
                      <Fa icon={faChevronUp} size="sm" />
                    {/if}
                  </div>
                </td>
              {/if}
            </tr>

            {#if (layerValuesExpanded[i] === undefined || layerValuesExpanded[i] === true) && layerValue.type !== LayerTypes.RASTER}
              <tr style={layerValuesExpanded[i] === true ? 'border-top: 0;' : ''}>
                <td colspan="2">
                  <div class="expanded-container">
                    <table class="table is-bordered is-striped is-narrow is-hoverable is-fullwidth">
                      <tbody>
                        {#each Object.keys(layerValue.values) as layerValueRow}
                          <tr>
                            <td class="name">{layerValueRow}</td>
                            <td class="value">{layerValue.values[layerValueRow]}</td>
                          </tr>
                        {/each}
                      </tbody>
                    </table>
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
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
    background: none !important ;
    border-radius: 50%;
    border: 0 !important;
    box-sizing: none !important;
    height: 34px;
    margin-left: -7px;
    margin-top: -7px;
    position: absolute;
    width: 34px;
    z-index: 10;
  }

  .data-container {
    background-color: #fff;
    border-radius: 10px;
    border: 1px solid #ccc;
    bottom: 50px;
    box-shadow: 3px 3px 3px rgba(0, 0, 0, 0.1);
    font-family: ProximaNova, sans-serif;
    font-size: 11px;
    right: 10px;
    min-height: 250px;
    min-width: 325px;
    width: fit-content;
    padding: 10px;
    position: absolute;
    //width: 325px;

    .header {
      align-items: right;
      background: #e3e3e3;
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

      .coordinates {
        margin: 0;
      }

      .first-column {
        align-items: center;
        display: flex;
        justify-content: left;

        .icon {
          margin-right: 5px;
          width: 20px;
        }

        .name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          width: 100px;
        }
      }
      .second-column {
        overflow: hidden;
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 125px;

        .expand-collapse {
          cursor: pointer;
          margin-right: 2px;
          opacity: 0.5;

          &:hover {
            opacity: 1;
          }
        }
      }
      .expanded-container {
        padding-left: 25px;
        max-height: 150px;
        overflow-y: auto;

        td.name,
        td.value {
          width: 50%;
        }

        td.value {
          text-align: right;
        }
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

  .table.is-striped tbody tr:not(.is-selected):nth-child(even) {
    background-color: #fafafa;
  }

  :global(.mapboxgl-query-info-control) {
    background-position: center !important;
    background-repeat: no-repeat !important;
    background-size: 75% !important;
    background: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"/></svg>');
  }
  .third-column {
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 125px;
  }
</style>
