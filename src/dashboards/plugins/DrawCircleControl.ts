import type { IControl, Map } from 'maplibre-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { CircleMode, DragCircleMode, DirectMode, SimpleSelectMode } from 'maplibre-gl-draw-circle'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'

// see: https://github.com/zakjan/mapbox-gl-draw-geodesic
export default class MaplibreDrawCircleControl implements IControl {
  private controlContainer: HTMLElement | undefined
  private addButton: HTMLButtonElement | undefined
  private dragButton: HTMLButtonElement | undefined
  private map?: Map
  private draw: MapboxDraw

  onAdd(map: Map): HTMLElement {
    this.map = map

    //Below button is just dummy for the control.
    this.controlContainer = document.createElement('div')
    this.controlContainer.className = 'mapboxgl-ctrl mapboxgl-ctrl-group'
    this.addButton = document.createElement('button')
    this.addButton.className = 'maplibre-drawcircle-icon'
    this.addButton.type = 'button'
    this.addButton.addEventListener('click', () => {
      this.addCircle()
    })
    this.controlContainer.appendChild(this.addButton)

    this.dragButton = document.createElement('button')
    this.dragButton.className = 'maplibre-dragcircle-icon'
    this.dragButton.type = 'button'
    this.dragButton.addEventListener('click', () => {
      this.dragCircle()
    })
    this.controlContainer.appendChild(this.dragButton)

    this.draw = new MapboxDraw({
      displayControlsDefault: true,
      userProperties: true,
      defaultMode: 'draw_circle',
      clickBuffer: 10,
      touchBuffer: 10,
      modes: {
        ...MapboxDraw.modes,
        draw_circle: CircleMode,
        direct_select: DirectMode,
        simple_select: SimpleSelectMode,
        drag_circle: DragCircleMode,
      },
    })

    // Add this draw object to the map when map loads
    this.map.addControl(this.draw)

    return this.controlContainer
  }

  addCircle() {
    // Provide the default radius as an option to CircleMode
    this.draw.changeMode('draw_circle', { initialRadiusInKm: 0.5 })
  }

  dragCircle() {
    // Provide the default radius as an option to CircleMode
    this.draw.changeMode('drag_circle')
  }

  onRemove(): void {
    if (!this.controlContainer || !this.controlContainer.parentNode || !this.map || !this.addButton) {
      return
    }
    this.controlContainer.parentNode.removeChild(this.controlContainer)
    this.map.removeControl(this.draw)
    this.draw = null
    this.map = undefined
  }
}
