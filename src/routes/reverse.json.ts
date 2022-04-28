import { lngLatToGoogle } from 'global-mercator'
import path from 'path'
import { getTile, intersectsFeaturesOnTile } from './lib/vectorTile'

// Zoom level to fetch tiles from `admin.mbtiles`
const zoomBase = 7
// mbtiles for admin data
const adminTiles = path.resolve('./data/admin.mbtiles')

const reverse = async (lng: number, lat: number) => {
  const lnglat = [lng, lat]
  const [x, y] = lngLatToGoogle(lnglat, zoomBase)
  const buffer = await getTile(adminTiles, zoomBase, x, y)
  const features = intersectsFeaturesOnTile(buffer, zoomBase, x, y, lnglat)
  return features
}

// Example URL
// http://localhost:3000/reverse.json?lng=36.8069&lat=-1.29219
export async function get({ url }) {
  let lng: string | number | undefined = url.searchParams.get('lng')
  let lat: string | number | undefined = url.searchParams.get('lat')

  if (!(lng && lat)) return { status: 400 }

  lng = Number(lng)
  lat = Number(lat)

  return {
    body: await reverse(lng, lat),
  }
}
