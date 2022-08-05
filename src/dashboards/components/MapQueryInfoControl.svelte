<script lang="ts">
  import { onMount } from 'svelte'
  import { Popup, type Map, type MapGeoJSONFeature, type MapMouseEvent } from 'maplibre-gl'

  export let map: Map
  let mapQueryInfoControl = null
  let isPopupEnabled = false
  let popup: Popup
  const ADM_ID = 'admin'

  // layer change
  $: {
    if (map) {
      if (mapQueryInfoControl !== null && map.hasControl(mapQueryInfoControl) === false) {
        map.addControl(mapQueryInfoControl, 'top-right')
      }
    }
  }

  // eslint-disable-next-line
  function MapQueryInfoControl() {}

  MapQueryInfoControl.prototype.onAdd = function (map: Map) {
    this.map = map
    this.container = document.createElement('div')
    this.container.title = 'Query Layer Information'
    this.container.classList.add('mapboxgl-ctrl', 'mapboxgl-ctrl-group')

    this.queryInfoContainer = document.createElement('div')
    this.queryInfoContainer.classList.add('mapboxgl-query-info-list')
    this.container.appendChild(this.queryInfoContainer)

    this.button = document.createElement('button')
    this.button.classList.add('mapboxgl-query-info-control')
    this.button.type = 'button'
    this.button.addEventListener('click', () => {
      if (isPopupEnabled === false) {
        console.log(map.getCanvas().style.cursor)
        map.getCanvas().style.cursor = 'crosshair'
        isPopupEnabled = true
        map.on('click', this.onClick)
      } else {
        map.getCanvas().style.cursor = ''
        isPopupEnabled = false
        map.off('click', this.onClick)
      }
    })
    this.container.appendChild(this.button)

    return this.container
  }

  MapQueryInfoControl.prototype.onClick = function (e: MapMouseEvent) {
    const layers = map.getStyle().layers.filter((layer) => ![ADM_ID].includes(layer.id))
    const features: MapGeoJSONFeature[] = map.queryRenderedFeatures(e.point, {
      layers: layers.map((layer) => layer.id),
    })
    if (popup) {
      popup.remove()
    }
    if (features.length === 0) return
    const html = `
    <div class="popup-content">
    ${features
      .map((f) => {
        return `
		  <div class="popup-layer-name">${f.layer.id}</div>
      <table class="popup-table">
      ${Object.keys(f.properties)
        .map((key) => {
          return `
        <tr class="popup-table-th"><th class="popup-table-th">${key
          .replace(/_/g, ' ')
          .replace(/-/g, ' ')}</th><td class="popup-table-td">${f.properties[key]}</td></tr>`
        })
        .join('')}
      </table>
      `
      })
      .join('')}
  </div>
    `
    popup = new Popup().setLngLat(e.lngLat).setHTML(html).setMaxWidth('400px').addTo(map)
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
  })
</script>

<style lang="scss">
  :global(.mapboxgl-query-info-control) {
    background-position: center !important;
    background-repeat: no-repeat !important;
    background-size: 75% !important;
    background: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!-- Font Awesome Pro 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) --><path d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 110c23.196 0 42 18.804 42 42s-18.804 42-42 42-42-18.804-42-42 18.804-42 42-42zm56 254c0 6.627-5.373 12-12 12h-88c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h12v-64h-12c-6.627 0-12-5.373-12-12v-24c0-6.627 5.373-12 12-12h64c6.627 0 12 5.373 12 12v100h12c6.627 0 12 5.373 12 12v24z"/></svg>');
  }

  :global(.maplibregl-popup-content) {
    overflow-y: scroll;
    max-height: 300px;
  }

  :global(.popup-layer-name) {
    font-size: 13px;
    font-weight: 600;
    text-decoration: underline;
  }

  :global(table.popup-table) {
    border-collapse: collapse;
    margin: 0 auto;
    width: 100%;
  }

  :global(td.popup-table-td),
  :global(th.popup-table-th) {
    border: 1px solid #ccc;
    margin: 10px;
    padding: 2px;
    text-align: left;
    white-space: pre-wrap;
  }

  :global(th.popup-table-th) {
    background: #efefef;
    width: 30%;
    word-wrap: break-word;
  }
</style>
