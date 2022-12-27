<script lang="ts">
  import { Map, MapMouseEvent, Popup } from 'maplibre-gl'
  import { layerList } from '$stores'
  import { onMount, onDestroy } from 'svelte'
  import { Accordion } from '@undp-data/svelte-undp-design'
  import { clean, getActiveBandIndex, getLayerStyle, getValueFromRasterTileUrl } from '$lib/helper'
  import type { RasterTileMetadata } from '$lib/types'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'

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

  let features: PointFeature[] = []

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
    for (const layer of $layerList) {
      const props: { [key: string]: string | number } = {
        name: layer.name,
      }

      const layerStyle = getLayerStyle(map, layer.id)
      if (layerStyle.type === 'raster') {
        const rasterInfo = layer.info as RasterTileMetadata
        if (rasterInfo?.isMosaicJson) {
          // mosaicjson

          const baseUrl = `${PUBLIC_TITILER_ENDPOINT.replace(
            'cog',
            'mosaicjson',
          )}/point/${lng},${lat}?url=${getValueFromRasterTileUrl(map, layer.id, 'url')}`
          const res = await fetch(baseUrl)
          const data = await res.json()
          if (!(data.values.length > 0 && data.values[0].length > 0 && data.values[0][1].length > 0)) {
            continue
          }

          const bandIndex = getActiveBandIndex(rasterInfo)
          const value = `${data.values[0][1]}`
          const values: number[] = value.split(',').map((v) => Number(v))
          const layerUniqueValues = rasterInfo.band_metadata[bandIndex][1].STATISTICS_UNIQUE_VALUES
          for (const v of values) {
            if (layerUniqueValues) {
              const key = layerUniqueValues[v]
              props[key ? key : `Band=${values.indexOf(v) + 1}`] = v
            } else {
              props[`Band=${values.indexOf(v) + 1}`] = v
            }
          }
        } else {
          // COG

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
          if (layerHasNoDataValue) continue

          const layerUniqueValues = rasterInfo.band_metadata[bandIndex][1].STATISTICS_UNIQUE_VALUES
          data.values.forEach((value) => {
            if (layerUniqueValues) {
              const key = layerUniqueValues[value]
              props[key ? key : `Band=${rasterInfo.active_band_no}`] = value
            } else {
              props[`Band=${rasterInfo.active_band_no}`] = value
            }
          })
        }
      } else {
        // vector
        const queriedFeatures = map.queryRenderedFeatures(e.point, {
          layers: [layer.id],
        })
        if (queriedFeatures && queriedFeatures.length > 0) {
          Object.keys(queriedFeatures[0].properties).forEach((key) => {
            props[key] = queriedFeatures[0].properties[key]
          })
        }
      }

      const feature: PointFeature = {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        id: layer.id,
        properties: props,
      }
      console.log(feature)
      if (Object.keys(props).filter((key) => key !== 'name').length > 0) {
        features.push(feature)
      }
    }
    features.forEach((feature, index) => {
      expanded[feature.id] = index === 0
      if (index === 0) {
        expandedLayerId = feature.id as string
      }
    })
    if (features.length > 0) {
      popup = new Popup().setLngLat(e.lngLat).setDOMContent(popupContainer).setMaxWidth('300px').addTo(map)
    } else {
      if (popup) {
        popup.remove()
        popup = undefined
      }
    }
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
</script>

<div
  bind:this={popupContainer}
  class="popup-container">
  {#each features as feature}
    <Accordion
      headerTitle={`${feature.properties.name}`}
      bind:isExpanded={expanded[feature.id]}>
      <div
        slot="content"
        class="px-1">
        <table class="attr-table table is-striped is-narrow is-hoverable s-fullwidth">
          <thead>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {#each Object.keys(feature.properties) as property}
              {#if property !== 'name'}
                <tr>
                  <td>{clean(property)}</td>
                  <td>{feature.properties[property]}</td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
    </Accordion>
  {/each}
</div>

<style lang="scss">
  .popup-container {
    max-height: 300px;
    overflow-y: auto;

    .attr-table {
      width: 100%;
    }
  }
</style>
