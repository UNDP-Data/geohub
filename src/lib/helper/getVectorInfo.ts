import { fetchUrl } from './fetchUrl'

/**
 * get tilestats data for specified layer from vector tile
 * @param pbfPath vector tile path. path of 0/0/0.pbf should be used
 * @param layerName layer name on vector tile
 * @returns tilestats information
 */
export const getVectorInfo = async (pbfPath: string, layerName: string, isDynamic: boolean) => {
  if (isDynamic) {
    return await fetchUrl(`vectorinfo/dynamic?layer_name=${layerName}`)
  } else {
    return await fetchUrl(`vectorinfo/static?path=${pbfPath}&layer_name=${layerName}`)
  }
}
