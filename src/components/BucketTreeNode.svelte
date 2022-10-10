<script context="module" lang="ts">
  const expansionState = {}
</script>

<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte'
  import { slide } from 'svelte/transition'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { v4 as uuidv4 } from 'uuid'
  import Fa from 'svelte-fa'
  import FaLayers from 'svelte-fa/src/fa-layers.svelte'
  import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
  import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase'
  import { faDownload } from '@fortawesome/free-solid-svg-icons/faDownload'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'
  import { faWindowClose } from '@fortawesome/free-solid-svg-icons/faWindowClose'
  import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup'
  import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
  import { faForward } from '@fortawesome/free-solid-svg-icons/faForward'
  import { faBackward } from '@fortawesome/free-solid-svg-icons/faBackward'
  import type { RasterLayerSpecification, RasterSourceSpecification } from 'maplibre-gl'

  import AddLayerModal from '$components/controls/AddLayerModal.svelte'
  import BucketTreeNodeCardButton from '$components/BucketTreeNodeCardButton.svelte'
  import {
    ClassificationMethodTypes,
    COLOR_CLASS_COUNT,
    DEFAULT_COLORMAP,
    ErrorMessages,
    LayerIconTypes,
    LayerTypes,
    STAC_PAGINATION_PREV,
    STAC_PAGINATION_NEXT,
    StatusTypes,
  } from '$lib/constants'
  import { fetchUrl, clean, downloadFile, getBase64EncodedUrl, getActiveBandIndex } from '$lib/helper'
  import type {
    BannerMessage,
    TreeNode,
    RasterTileMetadata,
    LayerInfoMetadata,
    VectorLayerTileStatLayer,
    VectorTileMetadata,
    BandMetadata,
  } from '$lib/types'
  import { map, bucketList, layerList, indicatorProgress, bannerMessages, modalVisible, martinIndex } from '$stores'
  import { PUBLIC_TITILER_ENDPOINT } from '$lib/variables/public'

  export let level = 0
  export let node: TreeNode
  export let hideCloseButton = false

  const dispatch = createEventDispatcher()
  const iconRaster = LayerIconTypes.find((icon) => icon.id === LayerTypes.RASTER)

  let iconVector = LayerIconTypes.find((icon) => icon.id === LayerTypes.VECTOR)
  let layerInfoMetadata: LayerInfoMetadata
  let loadingLayer = false
  let isAddLayerModalVisible: boolean
  // let tooltipTimer: ReturnType<typeof setTimeout>

  $: tree = node
  $: ({ label, children, path, url, isRaster, geomType, id } = tree)
  $: expanded = expansionState[label] || false
  $: mmap = $map
  const bid = level == 0 ? node.id : null
  //console.log(`${bid} ${JSON.stringify(node)}`)
  onMount(() => {
    if (level === 0) toggleExpansion()
    if (geomType !== undefined) {
      iconVector = getVectorLayerIcon(geomType)
    }
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
      // the info endpoint returns metadata for rasters. the same needs to be implemented for
      // vector data with the difference that the metadata will be coming from .metadata.json

      //const rasterChildNodes = node.children.filter((item) => item.url !== null && item.isRaster)
      //const vectorChildNodes = node.children.filter((item) => item.url !== null && !item.isRaster)
      const childNodes = node.children.filter((item) => item.url !== null)
      Promise.all(
        childNodes.map((node) => {
          return {
            data: node.isRaster ? getRasterMetadata(node) : getVectorMetadata(node),
            node,
          }
        }),
      ).then((responses) => {
        responses.forEach((response) => {
          response.data.then(() => {
            if (response.node.isRaster) {
              if (response.node.isStac) {
                const bucketStac = $bucketList.find((bucket) => bucket.id === response.node.path.split('/')[0])
                const itemsUrl = []
                itemsUrl.push(bucketStac.url)
                itemsUrl.push(response.node.path.split('/')[1])
                itemsUrl.push('items')
                itemsUrl.push(response.node.label)
              }
            }
          })
        })
      })
    }

    setProgressIndicator(false)
  }

  const getVectorLayerIcon = (layerGeomType: string) => {
    return LayerIconTypes.find((icon) => layerGeomType.toLowerCase().includes(icon.id))
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
  const handleKD = (event: KeyboardEvent) => {
    if (event.key == 'Enter') {
      const bucketDiv = document.getElementById(bid)
      //console.log(bucketDiv)
      bucketDiv.setAttribute('tabindex', '0')
      bucketDiv.focus()
      bucketDiv.blur()

      handleRemoveBucket()
      //const id = document.activeElement.id
      // if (id !== bid) {
      //   console.log(`failed ${id} ${bid}`)
      // }
    }
  }

  let stacPaginationAction = ''
  let stacPaginationLabel = ''

  const handleStacPagination = (action: string) => {
    stacPaginationAction = action

    if (action === STAC_PAGINATION_PREV) {
      stacPaginationLabel = children[0].label
    } else if (action === STAC_PAGINATION_NEXT) {
      stacPaginationLabel = children[children.length - 1].label
    }

    updateTreeStore()
  }

  const handleEnterKeyForDownload = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      downloadFile(url)
    }
  }
</script>

<li style="padding-left:{level * 0.75}rem;">
  <div style="padding-bottom: 5px;">
    {#if children}
      <div class="node-container" transition:slide={{ duration: expanded ? 0 : 350 }}>
        <a
          style="color:gray; margin-left:5px"
          class="tree-icon"
          href="#"
          role="button"
          on:click={() => toggleExpansion()}>
          {#if loadingLayer === true}
            <Fa icon={faSync} size="sm" spin />
          {:else if level === 0}
            <Fa icon={faDatabase} size="sm" style="cursor: pointer;" />
          {:else if !expanded}
            <Fa icon={faChevronRight} size="sm" style="cursor: pointer;" />
          {:else}
            <Fa icon={faChevronRight} size="sm" style="cursor: pointer; transform: rotate(90deg);" />
          {/if}
        </a>

        <div class="name">
          <div class="columns">
            <div class="column">{clean(label)}</div>
          </div>
        </div>
        {#if level === 0 && hideCloseButton === false}
          <a
            style="color: gray;width: 19.5px; height: 19.5px; cursor: pointer;"
            href="#"
            role="button"
            on:click={handleRemoveBucket}
            on:keydown={handleKD}>
            <Fa icon={faWindowClose} size="sm" />
          </a>
        {/if}
      </div>
    {:else}
      <div class="node-container">
        <!-- The modal is located here so the focus is set to ne next element -->
        <AddLayerModal bind:isModalVisible={isAddLayerModalVisible} treeNode={tree} />
        <a style="color: gray;cursor: pointer;" href="#" role="button" on:click={loadLayer}>
          {#if loadingLayer === true}
            <Fa icon={faSync} size="sm" spin />
          {:else}
            <Wrapper>
              <FaLayers size="sm" style="cursor: pointer;">
                <Fa icon={faLayerGroup} scale={1} />
                <Fa icon={faPlus} scale={0.8} translateY={0.4} translateX={0.5} style="color:black" />
              </FaLayers>
              <Tooltip showDelay={500} hideDelay={100} yPos="above">Add Layer</Tooltip>
            </Wrapper>
          {/if}
        </a>

        {#if isRaster}
          <div class="name raster">
            {#if node.isStac}
              {clean(
                path
                  .split('/')
                  .pop()
                  .replace(/\.[^/.]+$/, ''),
              )}
            {:else}
              {clean(label)}
            {/if}
          </div>
        {:else}
          <div class="name vector">
            {clean(label)}
          </div>
        {/if}

        <BucketTreeNodeCardButton bind:layerInfoMetadata bind:node />

        {#if isRaster}
          <div
            class="icon"
            alt="Download Layer Data"
            style="cursor: pointer;"
            title="Download Layer Data"
            on:click={() => downloadFile(url)}
            on:keydown={handleEnterKeyForDownload}>
            <Wrapper>
              <Fa icon={faDownload} size="sm" />
              <Tooltip showDelay={0} hideDelay={100} yPos="above">Download Layer Data</Tooltip>
            </Wrapper>
          </div>
          <div class="icon" alt={iconRaster.label} title={iconRaster.label}>
            <Wrapper>
              <Fa rotate={140} icon={iconRaster.icon} size="sm" primaryColor={iconRaster.color} />
              <Tooltip showDelay={0} hideDelay={100} yPos="above">Raster</Tooltip>
            </Wrapper>
          </div>
        {:else}
          <div class="icon" alt={iconVector.label} title={iconVector.label}>
            <Wrapper>
              <Fa icon={iconVector.icon} size="sm" primaryColor={iconVector.color} />
              <Tooltip showDelay={500} hideDelay={100} yPos="above">Vector</Tooltip>
            </Wrapper>
          </div>
        {/if}
      </div>
    {/if}

    {#if expanded && level > 0 && isRaster && node.isStac}
      <div class="columns pl-4 pb-2 pt-2">
        <div class="column is-flex is-flex-direction-row">
          <div
            on:click={() => handleStacPagination(STAC_PAGINATION_PREV)}
            class={`pr-3 ${tree.paginationDirectionDisabled === STAC_PAGINATION_PREV ? 'disabled' : 'is-clickable'}`}
            alt="Previous layers"
            title="Previous layers">
            <Fa icon={faBackward} size="sm" />
          </div>
          &nbsp;
          <div
            on:click={() => handleStacPagination(STAC_PAGINATION_NEXT)}
            class={`is-clickable ${
              tree.paginationDirectionDisabled === STAC_PAGINATION_NEXT ? 'disabled' : 'is-clickable'
            }`}
            alt="Next layers"
            title="Next layers">
            <Fa icon={faForward} size="sm" />
          </div>
        </div>
      </div>
    {/if}
  </div>
</li>

{#if expanded && children}
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

    .name {
      overflow: hidden;
      padding-left: 5px;
      text-overflow: ellipsis;
      width: 100%;

      @media (prefers-color-scheme: dark) {
        color: white;
      }

      .columns .column {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .icon {
      padding-left: 10px;
      padding-right: 10px;
    }

    .tree-icon {
      margin-right: 5px;

      @media (prefers-color-scheme: dark) {
        color: rgb(138, 20, 20);
      }
    }
  }

  .disabled {
    cursor: default;
    opacity: 0.15;
  }
</style>
