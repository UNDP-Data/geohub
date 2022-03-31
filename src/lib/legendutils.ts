import { map } from '../stores/index'
import { Map } from 'maplibre-gl'

export function refreshLayerURL(map: Map, srcID: string, layerURL: URL) {
  map.getSource(srcID).tiles = [decodeURI(layerURL.toString())]
  map.style.sourceCaches[srcID].clearTiles()
  map.style.sourceCaches[srcID].update(map.transform)
  map.triggerRepaint()
}
