<script lang="ts">
  import { v4 as uuidv4 } from 'uuid'
  import type {
    LineLayerSpecification,
    FillLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
    VectorSourceSpecification,
  } from 'maplibre-gl'
  import { cloneDeep } from 'lodash-es'
  import type { TreeNode, VectorTileMetadata } from '$lib/types'
  import BucketTreeItemCardButton from '$components/BucketTreeItemCardButton.svelte'
  import BucketTreeItemLegend from './BucketTreeItemLegend.svelte'
  import BucketTreeLabel from './BucketTreeLabel.svelte'
  import BucketTreeItemIcon from './BucketTreeItemIcon.svelte'

  import { map, layerList, indicatorProgress } from '$stores'
  import { fetchUrl } from '$lib/helper'
  import { LayerTypes } from '$lib/constants'

  export let tree: TreeNode

  const loadLayer = async () => {
    if (tree.isRaster) throw new Error('This component can only be used for vector type')

    try {
      $indicatorProgress = true
      if (!tree.metadata) {
        tree.metadata = await getVectorMetadata(tree)
      }
      await addLayer()
    } finally {
      $indicatorProgress = false
    }
  }

  const getVectorMetadata = async (node: TreeNode) => {
    let metadataUrl: string
    if (!node.dynamicSourceType) {
      const layerURL = new URL(node.url)
      const pbfpath = `${layerURL.origin}${decodeURIComponent(layerURL.pathname)}${layerURL.search}`
      metadataUrl = `/azstorage/metadata.json?pbfpath=${encodeURI(pbfpath)}`
    } else {
      metadataUrl = node.url.replace('tile.json', 'metadata.json')
    }
    const data: VectorTileMetadata = await fetchUrl(metadataUrl)
    return data
  }

  const addLayer = async () => {
    const tileSourceId = tree.path
    if (tree.metadata.json.vector_layers.length === 0) {
      throw new Error('No layer contained in this tileset.')
    }
    const selectedLayerId = tree.metadata.json.vector_layers[0].id

    let layerSource: VectorSourceSpecification
    if (!$map.getSource(tileSourceId)) {
      if (tree.dynamicSourceType) {
        layerSource = {
          type: LayerTypes.VECTOR,
          url: tree.url,
        }
      } else {
        layerSource = {
          type: LayerTypes.VECTOR,
          tiles: [tree.url],
          minzoom: tree.metadata.minzoom | 0,
          maxzoom: tree.metadata.maxzoom | 24,
        }
      }

      if (!(tileSourceId in $map.getStyle().sources)) {
        $map.addSource(tileSourceId, layerSource)
      }
    } else {
      layerSource = JSON.parse(JSON.stringify($map.getStyle().sources[tileSourceId]))
    }

    const layerId = `${selectedLayerId}-${uuidv4()}`
    let layerDefinition:
      | LineLayerSpecification
      | FillLayerSpecification
      | SymbolLayerSpecification
      | HeatmapLayerSpecification
    switch (tree.geomType.toLocaleLowerCase()) {
      case 'point':
        layerDefinition = {
          id: layerId,
          type: LayerTypes.SYMBOL,
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
            'icon-image': 'circle',
            'icon-size': 1,
          },
        }
        break
      case 'linestring':
        layerDefinition = {
          id: layerId,
          type: LayerTypes.LINE,
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': 'rgb(53, 175, 109)',
            'line-width': 0.5,
          },
        }
        break
      case 'polygon':
        layerDefinition = {
          id: layerId,
          type: LayerTypes.FILL,
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
          },
          paint: {
            'fill-color': 'rgb(20, 180, 60)',
            'fill-outline-color': 'rgb(110, 110, 110)',
            'fill-opacity': 0.6,
          },
        }
        break
      case 'heatmap':
        layerDefinition = {
          id: layerId,
          type: LayerTypes.HEATMAP,
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
          },
          paint: {
            'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0,
              'rgba(0, 0, 255, 0)',
              0.1,
              'rgb(0,0,255)',
              0.3,
              'rgb(0,255,255)',
              0.5,
              'rgb(0,255,0)',
              0.7,
              'rgb(255,255,0)',
              1,
              'rgb(255,0,0)',
            ],
            'heatmap-intensity': 1,
            'heatmap-opacity': 1,
            'heatmap-radius': 30,
            'heatmap-weight': 1,
          },
        }
        break
      default:
        return
    }

    layerDefinition.minzoom = Number(tree.metadata.minzoom && tree.metadata.minzoom >= 0 ? tree.metadata.minzoom : 0)
    layerDefinition.maxzoom = Number(tree.metadata.maxzoom && tree.metadata.maxzoom <= 24 ? tree.metadata.maxzoom : 24)

    const layerName = tree.dynamicSourceType ? tree.label : tree.path.split('/')[tree.path.split('/').length - 2]

    $layerList = [
      {
        name: layerName,
        definition: layerDefinition,
        type: LayerTypes.VECTOR,
        info: tree.metadata,
        visible: true,
        url: tree.url,
        source: layerSource,
        tree: tree,
      },
      ...$layerList,
    ]

    $map.addLayer(layerDefinition)

    // set layer list features properties to diplay in query panel info
    $map.on('click', layerDefinition.id, function (e) {
      const layer = $layerList.find((layer) => layer.definition.id == layerDefinition.id)
      if (layer) {
        const layerClone = cloneDeep(layer)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        layerClone.features = e.features.length > 0 ? e.features[0].properties : []
        const layerIndex = $layerList.findIndex((layer) => layer.definition.id === layerDefinition.id)
        $layerList[layerIndex] = layerClone
      }
    })
  }
</script>

<BucketTreeItemIcon on:addLayer={loadLayer} />
<BucketTreeLabel bind:tree />
<BucketTreeItemCardButton bind:tree />
<BucketTreeItemLegend bind:tree />
