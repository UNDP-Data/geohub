<script lang="ts">
  import { v4 as uuidv4 } from 'uuid'
  import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl'

  import type { BannerMessage, RasterTileMetadata, TreeNode } from '$lib/types'
  import BucketTreeItemCardButton from '$components/BucketTreeItemCardButton.svelte'
  import BucketTreeItemLegend from './BucketTreeItemLegend.svelte'
  import BucketTreeItemDownloadButton from './BucketTreeItemDownloadButton.svelte'
  import BucketTreeLabel from './BucketTreeLabel.svelte'
  import BucketTreeItemIcon from './BucketTreeItemIcon.svelte'

  import { map, layerList, bannerMessages, indicatorProgress } from '$stores'
  import { fetchUrl, getActiveBandIndex, getBase64EncodedUrl, paramsToQueryString } from '$lib/helper'
  import {
    COLOR_CLASS_COUNT,
    COLOR_CLASS_COUNT_MAXIMUM,
    DEFAULT_COLORMAP,
    ErrorMessages,
    LayerTypes,
    StatusTypes,
  } from '$lib/constants'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'

  export let tree: TreeNode

  const loadLayer = async () => {
    try {
      if (!tree.isRaster) throw new Error('This component can only be used for raster type')
      $indicatorProgress = true

      if (tree.isRaster && tree.isStac && tree.isMosaicJSON) {
        await loadMosaicJsonLayer()
      } else {
        await loadRasterLayer()
      }
    } catch (err) {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.WARNING,
        title: 'Whoops! Something went wrong.',
        message: err.message,
      }
      bannerMessages.update((data) => [...data, bannerErrorMessage])
    } finally {
      $indicatorProgress = false
    }
  }

  const loadMosaicJsonLayer = async () => {
    const zoom = $map.getZoom()
    if (zoom < 5) {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.WARNING,
        title: 'Whoops! Something went wrong.',
        message: ErrorMessages.TOO_SMALL_ZOOM_LEVEL,
      }
      bannerMessages.update((data) => [...data, bannerErrorMessage])
      return
    }

    const bounds = $map.getBounds()
    const bbox = [
      bounds.getSouthWest().lng,
      bounds.getSouthWest().lat,
      bounds.getNorthEast().lng,
      bounds.getNorthEast().lat,
    ]
    const mosaicjsonRes = await fetchUrl(
      `stac/mosaicjson?url=${encodeURIComponent(tree.url)}&bbox=${JSON.stringify(bbox)}&asset=${tree.path}`,
    )

    const numberOfClasses = mosaicjsonRes.classmap ? Object.keys(mosaicjsonRes.classmap).length : 0
    const isUniqueValueLayer = numberOfClasses > 0 && numberOfClasses <= COLOR_CLASS_COUNT_MAXIMUM ? true : false
    const tilejson = await fetchUrl(mosaicjsonRes.tilejson)
    const layerInfo = await getMosaicJsonMetadata(tilejson, isUniqueValueLayer)
    const bandMetaStats = layerInfo.band_metadata[0][1]
    const layerBandMetadataMin = bandMetaStats['STATISTICS_MINIMUM']
    const layerBandMetadataMax = bandMetaStats['STATISTICS_MAXIMUM']

    bandMetaStats.STATISTICS_UNIQUE_VALUES = mosaicjsonRes.classmap

    let defaultColorMap = DEFAULT_COLORMAP
    if (layerInfo.band_metadata.length > 1) {
      defaultColorMap = ''
    }
    tilejson.tiles = tilejson.tiles.map((tile) => {
      tile = tile.replace('http://', 'https://')
      if (layerInfo.band_metadata.length > 1) {
        return tile
      } else {
        const _url = new URL(tile)
        _url.searchParams.delete('colormap_name')
        _url.searchParams.delete('rescale')
        _url.searchParams.set('colormap_name', DEFAULT_COLORMAP)
        _url.searchParams.set('rescale', [layerBandMetadataMin, layerBandMetadataMax].join(','))
        return decodeURI(_url.toString())
      }
    })

    const layerSource: RasterSourceSpecification = {
      type: LayerTypes.RASTER,
      // convert http to https because titiler's /mosaicjson/tilejson.json does not return https protocol currently
      tiles: tilejson.tiles,
      minzoom: tilejson.minzoom | 0,
      maxzoom: tilejson.maxzoom | 22,
      bounds: tilejson.bounds,
      attribution:
        'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.\
              Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
    }
    if (layerSource.maxzoom > 24) {
      layerSource.maxzoom = 24
    }
    const tileSourceId = tree.id
    if (!(tileSourceId in $map.getStyle().sources)) {
      $map.addSource(tileSourceId, layerSource)
    }

    const layerId = uuidv4()
    const layerDefinition: RasterLayerSpecification = {
      id: layerId,
      type: LayerTypes.RASTER,
      source: tileSourceId,
      minzoom: layerSource.minzoom,
      maxzoom: layerSource.maxzoom,
      layout: {
        visibility: 'visible',
      },
    }

    const layerName = tree.path.split('/')[tree.path.split('/').length - 1]
    $layerList = [
      {
        id: layerId,
        name: layerName,
        info: layerInfo,
        tree: tree,
      },
      ...$layerList,
    ]

    let firstSymbolId = undefined
    for (const layer of $map.getStyle().layers) {
      if (layer.type === LayerTypes.SYMBOL) {
        firstSymbolId = layer.id
        break
      }
    }
    $map.addLayer(layerDefinition, firstSymbolId)
    $map.fitBounds(layerSource.bounds)
  }

  const getMosaicJsonMetadata = async (tilejson: { bounds: any; tiles: string[] }, isUniqueValue: boolean) => {
    const tileUrl = new URL(tilejson.tiles[0])
    const mosaicUrl = tileUrl.searchParams.get('url')
    const mosaicAssetUrl = `${PUBLIC_TITILER_ENDPOINT.replace('cog', 'mosaicjson')}/${tilejson.bounds.join(
      ',',
    )}/assets?url=${encodeURIComponent(mosaicUrl)}`
    const assets: string[] = await fetchUrl(mosaicAssetUrl)
    if (assets && assets.length > 0) {
      const assetUrl = assets[0].replace('/vsicurl/', '')
      const data: RasterTileMetadata = await getRasterMetadata(getBase64EncodedUrl(assetUrl))
      if (!(data.band_metadata.length > 1)) {
        const statsURL = `${PUBLIC_TITILER_ENDPOINT}/statistics?url=${encodeURIComponent(assetUrl)}${
          isUniqueValue ? '&categorical=true' : ''
        }`
        const layerStats = await fetchUrl(statsURL)
        data.stats = layerStats
        data.active_band_no = Object.keys(layerStats)[0]
      }
      return data
    } else {
      const data: RasterTileMetadata = {
        bounds: tilejson.bounds,
      }
      return data
    }
  }

  const loadRasterLayer = async () => {
    $indicatorProgress = true

    const b64EncodedUrl = getBase64EncodedUrl(tree.url)
    const layerInfo: RasterTileMetadata = await getRasterMetadata(b64EncodedUrl)
    const bandIndex = getActiveBandIndex(layerInfo)

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [bandName, bandMetaStats] = layerInfo.band_metadata[bandIndex]
    bandMetaStats.STATISTICS_UNIQUE_VALUES = await getClassesMap(bandIndex, layerInfo)

    if (!(layerInfo && layerInfo.band_metadata && layerInfo.band_metadata.length > 0)) {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.WARNING,
        title: 'Whoops! Something went wrong.',
        message: ErrorMessages.NO_LAYER_WITH_THAT_NAME,
      }
      bannerMessages.update((data) => [...data, bannerErrorMessage])
      return
    }

    const layerBandMetadataMin = layerInfo.band_metadata[bandIndex][1]['STATISTICS_MINIMUM']
    const layerBandMetadataMax = layerInfo.band_metadata[bandIndex][1]['STATISTICS_MAXIMUM']

    if (!(layerBandMetadataMin && layerBandMetadataMax)) {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.INFO,
        title: 'Whoops! Something went wrong.',
        message: ErrorMessages.UNDEFINED_BAND_METADATA_LAYER_MINMAX,
      }
      $bannerMessages = [...$bannerMessages, ...[bannerErrorMessage]]
      return
    }
    const titilerApiUrlParams = {
      scale: 1,
      TileMatrixSetId: 'WebMercatorQuad',
      url: b64EncodedUrl,
      bidx: bandIndex + 1,
      unscale: false,
      resampling: 'nearest',
      rescale: `${layerBandMetadataMin},${layerBandMetadataMax}`,
      return_mask: true,
      colormap_name: DEFAULT_COLORMAP,
    }

    const layerSource: RasterSourceSpecification = {
      type: LayerTypes.RASTER,
      tiles: [`${PUBLIC_TITILER_ENDPOINT}/tiles/{z}/{x}/{y}.png?${paramsToQueryString(titilerApiUrlParams)}`],
      tileSize: 256,
      minzoom: 0,
      maxzoom: layerInfo.maxzoom | 22,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      bounds: layerInfo['bounds'],
      attribution:
        'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.\
              Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
    }
    if (layerSource.maxzoom > 24) {
      layerSource.maxzoom = 24
    }
    const tileSourceId = tree.path
    if (!(tileSourceId in $map.getStyle().sources)) {
      $map.addSource(tileSourceId, layerSource)
    }

    const layerId = uuidv4()
    const layerDefinition: RasterLayerSpecification = {
      id: layerId,
      type: LayerTypes.RASTER,
      source: tileSourceId,
      minzoom: layerSource.minzoom,
      maxzoom: layerSource.maxzoom,
      layout: {
        visibility: 'visible',
      },
    }

    const layerName = tree.path.split('/')[tree.path.split('/').length - 1]
    $layerList = [
      {
        id: layerId,
        name: layerName,
        info: layerInfo,
        tree: tree,
      },
      ...$layerList,
    ]
    let firstSymbolId = undefined
    for (const layer of $map.getStyle().layers) {
      if (layer.type === LayerTypes.SYMBOL) {
        firstSymbolId = layer.id
        break
      }
    }
    $map.addLayer(layerDefinition, firstSymbolId)
    $map.fitBounds(layerSource.bounds)
  }

  const getRasterMetadata = async (url: string) => {
    const data: RasterTileMetadata = await fetchUrl(`${PUBLIC_TITILER_ENDPOINT}/info?url=${url}`)

    if (
      data &&
      data.band_metadata &&
      data.band_metadata.length > 0 &&
      //TODO needs fix: Ioan band
      Object.keys(data.band_metadata[0][1]).length === 0
    ) {
      const statistics = await fetchUrl(`${PUBLIC_TITILER_ENDPOINT}/statistics?url=${url}`)
      if (statistics) {
        for (let i = 0; i < data.band_metadata.length; i++) {
          const bandValue = data.band_metadata[i][0]
          const bandDetails = statistics[bandValue]
          if (bandDetails) {
            data.band_metadata[i][1] = {
              STATISTICS_MAXIMUM: `${bandDetails.max}`,
              STATISTICS_MEAN: `${bandDetails.mean}`,
              STATISTICS_MINIMUM: `${bandDetails.min}`,
              STATISTICS_STDDEV: `${bandDetails.std}`,
              STATISTICS_VALID_PERCENT: `${bandDetails.valid_percent}`,
            }
          }
        }
      }
    }
    return data
  }

  const getClassesMap = async (bandIndex: number, layerInfo: RasterTileMetadata) => {
    let classesMap = {}
    if (tree.isStac) {
      const collectionName = tree.path.split('/')[tree.path.split('/').length - 2]
      const collectionInfo = await fetchUrl(`${tree.collectionUrl}/${collectionName}`)
      // FixME: There is no standard object for the classes labels.

      if (collectionInfo.item_assets.map) {
        // Todo: Tested with ESA WorldCover 2020
        const classesObj = collectionInfo.item_assets.map['classification:classes']
        classesObj.forEach((item) => {
          classesMap[item['value']] = item['description']
        })
      } else if (collectionInfo.item_assets.data) {
        // Todo: Tested with Esri 10m Land Cover (10 Class)
        const classesObj = collectionInfo.item_assets.data['file:values']
        classesObj.forEach((item) => {
          classesMap[item['values'][0]] = item['summary']
        })
      } else {
        // Todo: Tested for LandCover of Canada
        const classesObj = collectionInfo.item_assets.landcover['file:values']
        classesObj.forEach((item) => {
          classesMap[item['values'][0]] = item['summary']
        })
      }
    } else {
      // local rasters
      const uvString = layerInfo.band_metadata[bandIndex][1]['STATISTICS_UNIQUE_VALUES']
      if (uvString) {
        classesMap = JSON.parse(uvString)
      }
    }
    return classesMap
  }
</script>

<BucketTreeItemIcon on:addLayer={loadLayer} />
<BucketTreeLabel bind:tree />
<BucketTreeItemCardButton bind:tree />
{#if !(tree.isStac && tree.isMosaicJSON)}
  <BucketTreeItemDownloadButton bind:tree />
{/if}
<BucketTreeItemLegend bind:tree />
