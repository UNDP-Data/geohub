<script context="module" lang="ts">
  const expansionState = {}
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import { v4 as uuidv4 } from 'uuid'
  import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl'

  import AddLayerModal from '$components/controls/AddLayerModal.svelte'
  import BucketTreeNodeCardButton from '$components/BucketTreeNodeCardButton.svelte'
  import {
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    DEFAULT_COLORMAP,
    ErrorMessages,
    LayerTypes,
    STAC_PAGINATION_PREV,
    STAC_PAGINATION_NEXT,
    StatusTypes,
  } from '$lib/constants'
  import { fetchUrl, getBase64EncodedUrl, getActiveBandIndex } from '$lib/helper'
  import type {
    BannerMessage,
    TreeNode,
    RasterTileMetadata,
    LayerInfoMetadata,
    VectorLayerTileStatLayer,
    VectorTileMetadata,
  } from '$lib/types'
  import { map, layerList, indicatorProgress, bannerMessages, modalVisible, martinIndex } from '$stores'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'
  import BucketTreeNodeLegendIcon from './BucketTreeNodeLegendIcon.svelte'
  import BucketTreeNodeDownloadButton from './BucketTreeNodeDownloadButton.svelte'
  import BucketTreeNodeLabel from './BucketTreeNodeLabel.svelte'
  import BucketTreeNodeCloseButton from './BucketTreeNodeCloseButton.svelte'
  import BucketTreeBranchIcon from './BucketTreeBranchIcon.svelte'
  import BucketTreeItemIcon from './BucketTreeItemIcon.svelte'
  import BucketTreeNodePagination from './BucketTreeNodePagination.svelte'

  export let level = 0
  export let node: TreeNode

  const dispatch = createEventDispatcher()

  let layerInfoMetadata: LayerInfoMetadata
  let loadingLayer = false
  let isAddLayerModalVisible: boolean

  $: tree = node
  $: ({ label, children, path, isRaster } = tree)
  $: expanded = expansionState[label] || false
  $: mmap = $map

  onMount(() => {
    if (level === 0) toggleExpansion()
  })

  onDestroy(() => {
    expansionState[label] = false
  })

  const toggleExpansion = () => {
    expanded = expansionState[label] = !expanded
    if (tree?.children.length === 0) updateTreeStore()

    setTimeout(() => {
      if (loadingLayer === true) {
        loadingLayer = false
      }
    }, 2000)
  }

  const updateTreeStore = async () => {
    setProgressIndicator(true)
    let treeData = []

    if (tree.isStac) {
      const catalogId = node.path.split('/')[0]
      treeData = await fetchUrl(
        `stac.json?id=${catalogId}&path=${tree.path}&token=${stacPaginationAction}&item=${stacPaginationLabel
          .split('/')
          .pop()
          .replace(/\.[^/.]+$/, '')}`,
      )
    } else if (tree.isMartin) {
      treeData = await fetchUrl(
        `martin.json?path=${tree.path}&label=${tree.label}${tree.url === null ? '&isschema=true' : ''}`,
      )
    } else {
      treeData = await fetchUrl(`azstorage.json?path=${tree.path}`)
    }

    if (treeData) {
      //set  node value to the result of the fetch. This will actualy work becauase the tree is recursive
      // TODO: evaluate if the  node should be assigned at ethe end of this function. This would allow to remove
      // potentially invalid layers from the tree!!!!
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      node = treeData.tree
    }

    setProgressIndicator(false)
  }

  const paramsToQueryString = (params: Record<string, unknown>) => {
    return Object.keys(params)
      .map((key) => key + '=' + params[key])
      .join('&')
  }

  const setProgressIndicator = (state: boolean) => {
    loadingLayer = state
    $indicatorProgress = state
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

  const getVectorMetadata = async (node: TreeNode) => {
    let data: VectorTileMetadata
    if (!node.isMartin) {
      const layerURL = new URL(node.url)
      const metaURI = `${layerURL.origin}${decodeURIComponent(layerURL.pathname).replace(
        '{z}/{x}/{y}.pbf',
        'metadata.json',
      )}${layerURL.search}`

      const layerMeta = await fetchUrl(metaURI)
      if (layerMeta.json) {
        layerMeta.json = JSON.parse(layerMeta.json)
      }
      data = layerMeta
    } else {
      const tilejson = await fetchUrl(node.url)
      data = {
        name: tilejson.name,
        format: 'pbf',
        center: `${(tilejson.bounds[0] + tilejson.bounds[2]) / 2},${(tilejson.bounds[1] + tilejson.bounds[3]) / 2},${
          tilejson.minzoom
        }`,
        bounds: `${tilejson.bounds[0]},${tilejson.bounds[1]},${tilejson.bounds[2]},${tilejson.bounds[3]}`,
        minzoom: tilejson.minzoom,
        maxzoom: tilejson.maxzoom,
      }

      const metadata = $martinIndex[node.path]
      Object.keys(metadata.properties).forEach((key) => {
        const dataType = metadata.properties[key]
        switch (dataType) {
          case 'varchar':
          case 'text':
          case 'char':
          case 'name':
            metadata.properties[key] = 'String'
            break
          case 'float4':
          case 'float8':
          case 'int2':
          case 'int4':
          case 'numeric':
            metadata.properties[key] = 'Number'
            break
        }
      })

      // const stats = await getVectorInfo(node.url.replace('.json', '/0/0/0.pbf'), node.path)
      const tilestatsLayer: VectorLayerTileStatLayer = {
        layer: node.path,
        geometry: node.geomType,
        count: null,
        attributeCount: null,
        attributes: null,
      }

      data.json = {
        vector_layers: [
          {
            id: metadata.id,
            fields: metadata.properties,
          },
        ],
        tilestats: {
          layerCount: 1,
          layers: [tilestatsLayer],
        },
      }
    }
    return data
  }

  const loadLayer = async () => {
    setProgressIndicator(true)
    const tileSourceId = path
    const layerId = uuidv4()

    if (!isRaster) {
      node.metadata = await getVectorMetadata(node)

      isAddLayerModalVisible = true
      $modalVisible = true
      $indicatorProgress = false

      setTimeout(function () {
        loadingLayer = false
      }, 350)
    } else {
      let layerInfo: RasterTileMetadata = {}
      const layerName = path.split('/')[path.split('/').length - 1]
      const collectionName = path.split('/')[path.split('/').length - 2]

      let b64EncodedUrl: string

      // ** TODO **
      // 1. misconfigured server - COGs
      /**
           * <Error>
              <Code>ResourceNotFound</Code>
              <Message>The specified resource does not exist. RequestId:3b0db3c7-101e-0042-23f2-8a5da0000000 Time:2022-06-28T13:22:30.1066451Z</Message>
            </Error>
          */

      b64EncodedUrl = getBase64EncodedUrl(node.url)
      layerInfo = await getRasterMetadata(node)

      const bandIndex = getActiveBandIndex(layerInfo)

      let classesMap = {}
      if (node.isStac) {
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

      const [bandName, bandMetaStats] = layerInfo.band_metadata[bandIndex]
      bandMetaStats.STATISTICS_UNIQUE_VALUES = classesMap

      if (!(layerInfo && layerInfo.band_metadata && layerInfo.band_metadata.length > 0)) {
        const bannerErrorMessage: BannerMessage = {
          type: StatusTypes.WARNING,
          title: 'Whoops! Something went wrong.',
          message: ErrorMessages.NO_LAYER_WITH_THAT_NAME,
        }
        bannerMessages.update((data) => [...data, bannerErrorMessage])
        $indicatorProgress = false
        loadingLayer = false
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

        if (!(tileSourceId in mmap.getStyle().sources)) {
          mmap.addSource(tileSourceId, layerSource)
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
    }

    $indicatorProgress = false

    setTimeout(function () {
      loadingLayer = false
    }, 350)
  }

  const handleRemoveBucket = () => {
    dispatch('remove', { node })
  }

  let stacPaginationAction = ''
  let stacPaginationLabel = ''

  const handleStacPagination = (event) => {
    const action = event.detail.action
    stacPaginationAction = action

    if (action === STAC_PAGINATION_PREV) {
      stacPaginationLabel = children[0].label
    } else if (action === STAC_PAGINATION_NEXT) {
      stacPaginationLabel = children[children.length - 1].label
    }

    updateTreeStore()
  }
</script>

<li style="padding-left:{level * 0.75}rem;">
  <div style="padding-bottom: 5px;">
    {#if children}
      <div class="node-container" transition:slide={{ duration: expanded ? 0 : 350 }}>
        <BucketTreeBranchIcon bind:loadingLayer bind:level bind:expanded on:toggleExpansion={toggleExpansion} />
        <BucketTreeNodeLabel bind:node={tree} />

        {#if level === 0}
          <BucketTreeNodeCloseButton on:remove={handleRemoveBucket} />
        {/if}
      </div>
    {:else}
      <div class="node-container" transition:slide={{ duration: expanded ? 0 : 350 }}>
        <BucketTreeItemIcon bind:loadingLayer on:addLayer={loadLayer}>
          <!-- The modal is located here so the focus is set to ne next element -->
          <AddLayerModal bind:isModalVisible={isAddLayerModalVisible} treeNode={tree} />
        </BucketTreeItemIcon>

        <BucketTreeNodeLabel bind:node={tree} />
        <BucketTreeNodeCardButton bind:layerInfoMetadata bind:node />
        <BucketTreeNodeDownloadButton bind:node={tree} />
        <BucketTreeNodeLegendIcon bind:node={tree} />
      </div>
    {/if}
    {#if expanded && level > 0 && isRaster && node.isStac}
      <BucketTreeNodePagination
        disabledPrev={tree.paginationDirectionDisabled === STAC_PAGINATION_PREV}
        disabledNext={tree.paginationDirectionDisabled === STAC_PAGINATION_NEXT}
        on:pagination={handleStacPagination} />
    {/if}
  </div>
</li>

{#if children && expanded}
  {#each children as child, ti}
    <svelte:self node={child} level={level + 1} />
  {/each}
{/if}

<style lang="scss">
  @import '../styles/popper.scss';

  .node-container {
    align-items: center;
    display: flex;
    height: auto;
    justify-content: left;

    .load-layer {
      -webkit-filter: invert(100%);
      filter: invert(100%);
    }
  }
</style>
