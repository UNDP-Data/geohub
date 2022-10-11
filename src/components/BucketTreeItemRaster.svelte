<script lang="ts">
  import { v4 as uuidv4 } from 'uuid'
  import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl'

  import type { BannerMessage, RasterTileMetadata, TreeNode } from '$lib/types'
  import BucketTreeItemCardButton from '$components/BucketTreeItemCardButton.svelte'
  import BucketTreeItemLegend from './BucketTreeItemLegend.svelte'
  import BucketTreeItemDownloadButton from './BucketTreeItemDownloadButton.svelte'
  import BucketTreeLabel from './BucketTreeLabel.svelte'
  import BucketTreeItemIcon from './BucketTreeItemIcon.svelte'

  import { map, layerList, bannerMessages, modalVisible } from '$stores'
  import { fetchUrl, getActiveBandIndex, getBase64EncodedUrl } from '$lib/helper'
  import {
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    DEFAULT_COLORMAP,
    ErrorMessages,
    LayerTypes,
    StatusTypes,
  } from '$lib/constants'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'

  export let tree: TreeNode
  export let isLoading = false
  export let setProgressIndicator = (state: boolean): void => {
    throw new Error('Please give the function from the parent component')
  }
  let isAddLayerModalVisible = false
  $: {
    $modalVisible = isAddLayerModalVisible
  }

  const loadLayer = async () => {
    if (!tree.isRaster) throw new Error('This component can only be used for raster type')
    setProgressIndicator(true)
    const tileSourceId = tree.path
    const layerId = uuidv4()

    const layerName = tree.path.split('/')[tree.path.split('/').length - 1]
    const collectionName = tree.path.split('/')[tree.path.split('/').length - 2]

    let b64EncodedUrl: string

    // ** TODO **
    // 1. misconfigured server - COGs
    /**
           * <Error>
              <Code>ResourceNotFound</Code>
              <Message>The specified resource does not exist. RequestId:3b0db3c7-101e-0042-23f2-8a5da0000000 Time:2022-06-28T13:22:30.1066451Z</Message>
            </Error>
          */

    b64EncodedUrl = getBase64EncodedUrl(tree.url)
    let layerInfo: RasterTileMetadata = await getRasterMetadata(tree)

    const bandIndex = getActiveBandIndex(layerInfo)

    let classesMap = {}
    if (tree.isStac) {
      const collectionInfo = await fetchUrl(`${tree.collectionUrl}/${collectionName}`)
      // FixME: There is no standard object for the classes labels.
      try {
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
      } catch (e) {
        console.log(e)
      }
    } else {
      /*
        local rasters
        */

      const uvString = layerInfo.band_metadata[bandIndex][1]['STATISTICS_UNIQUE_VALUES']
      try {
        classesMap = JSON.parse(uvString)
      } catch (e) {
        // const bannerErrorMessage: BannerMessage = {
        //   type: StatusTypes.WARNING,
        //   title: 'Whoops! Something went wrong.',
        //   message: ErrorMessages.FAILED_TO_PARSE_METADATA,
        // }
        // bannerMessages.update((data) => [...data, bannerErrorMessage])
        // $indicatorProgress = false
        // loadingLayer = false
        // throw new Error(JSON.stringify(uvString))
      }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const [bandName, bandMetaStats] = layerInfo.band_metadata[bandIndex]
    bandMetaStats.STATISTICS_UNIQUE_VALUES = classesMap

    if (!(layerInfo && layerInfo.band_metadata && layerInfo.band_metadata.length > 0)) {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.WARNING,
        title: 'Whoops! Something went wrong.',
        message: ErrorMessages.NO_LAYER_WITH_THAT_NAME,
      }
      bannerMessages.update((data) => [...data, bannerErrorMessage])
      setProgressIndicator(false)
      throw new Error(JSON.stringify(layerInfo))
    }

    const layerBandMetadataMin = layerInfo.band_metadata[bandIndex][1]['STATISTICS_MINIMUM']
    const layerBandMetadataMax = layerInfo.band_metadata[bandIndex][1]['STATISTICS_MAXIMUM']

    if (layerBandMetadataMin && layerBandMetadataMax) {
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        bounds: layerInfo['bounds'],
        attribution:
          'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.\
              Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
      }

      if (!(tileSourceId in $map.getStyle().sources)) {
        $map.addSource(tileSourceId, layerSource)
      }

      const layerDefinition: RasterLayerSpecification = {
        id: layerId,
        type: LayerTypes.RASTER,
        source: tileSourceId,
        minzoom: 0,
        maxzoom: 22,
        layout: {
          visibility: 'visible',
        },
      }

      $layerList = [
        {
          name: layerName,
          definition: layerDefinition,
          type: LayerTypes.RASTER,
          info: layerInfo,
          visible: true,
          url: b64EncodedUrl,
          colorMapName: DEFAULT_COLORMAP,
          continuous: {
            minimum: parseFloat(layerBandMetadataMin),
            maximum: parseFloat(layerBandMetadataMax),
          },
          intervals: {
            classification: ClassificationMethodTypes.EQUIDISTANT,
            numberOfClasses: COLOR_CLASS_COUNT,
            colorMapRows: [],
          },
          unique: {
            colorMapRows: [],
          },
          expression: '',
          legendType: '',
          source: layerSource,
        },
        ...$layerList,
      ]
      let firstSymbolId = undefined
      for (const layer of $map.getStyle().layers) {
        if (layer.type === 'symbol') {
          firstSymbolId = layer.id
          break
        }
      }
      $map.addLayer(layerDefinition, firstSymbolId)
    } else {
      const bannerErrorMessage: BannerMessage = {
        type: StatusTypes.INFO,
        title: 'Whoops! Something went wrong.',
        message: ErrorMessages.UNDEFINED_BAND_METADATA_LAYER_MINMAX,
      }
      $bannerMessages = [...$bannerMessages, ...[bannerErrorMessage]]
    }

    setTimeout(function () {
      setProgressIndicator(false)
    }, 350)
  }

  const getRasterMetadata = async (node: TreeNode) => {
    let b64EncodedUrl = getBase64EncodedUrl(node.url)
    const data: RasterTileMetadata = await fetchUrl(`${PUBLIC_TITILER_ENDPOINT}/info?url=${b64EncodedUrl}`)

    if (
      data &&
      data.band_metadata &&
      data.band_metadata.length > 0 &&
      //TODO needs fix: Ioan band
      Object.keys(data.band_metadata[0][1]).length === 0
    ) {
      const statistics = await fetchUrl(`${PUBLIC_TITILER_ENDPOINT}/statistics?url=${b64EncodedUrl}`)
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

  const paramsToQueryString = (params: Record<string, unknown>) => {
    return Object.keys(params)
      .map((key) => key + '=' + params[key])
      .join('&')
  }
</script>

<BucketTreeItemIcon bind:isLoading on:addLayer={loadLayer} />
<BucketTreeLabel bind:tree />
<BucketTreeItemCardButton bind:tree />
<BucketTreeItemDownloadButton bind:tree />
<BucketTreeItemLegend bind:tree />
