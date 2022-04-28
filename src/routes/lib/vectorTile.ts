import MBTiles from '@mapbox/mbtiles'
import { VectorTile } from 'mapbox-vector-tile'
import { geoContains } from 'd3-geo'
import fs from 'fs'

export const getTile = (file: string, z: number, x: number, y: number) => {
  if (!fs.existsSync(file)) {
    throw new Error(`mbtiles does not exist: ${file}`)
  }
  return new Promise<Uint8Array>((resolve, reject) => {
    new MBTiles(`${file}?mode=ro`, (err, mbtiles) => {
      if (err) reject(err)
      console.log(mbtiles)
      mbtiles.getTile(z, x, y, (err, data) => {
        if (err) {
          data = null
        }
        resolve(data)
      })
    })
  })
}

export const intersectsFeaturesOnTile = (buffer: Uint8Array, z: number, x: number, y: number, lnglat: number[]) => {
  const tile = new VectorTile(buffer)

  let layers = Object.keys(tile.layers)

  if (!Array.isArray(layers)) layers = [layers]

  const features = []
  layers.forEach((layerID) => {
    const layer = tile.layers[layerID]
    for (let i = 0; i < layer.length; i++) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const feature: any = layer.feature(i).toGeoJSON(x, y, z)
      if (layers.length > 1) feature.layer = layerID

      const geojson = {
        type: 'FeatureCollection',
        features: [feature],
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = geoContains(geojson as any, lnglat)
      if (res) {
        features.push(feature)
      }
    }
  })
  return features
}
