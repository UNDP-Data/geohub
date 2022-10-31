<script lang="ts">
  import type { TreeNode, VectorLayerMetadata, VectorLayerTileStatLayer, VectorTileMetadata } from '$lib/types'
  import AddLayerModal from '$components/controls/AddLayerModal.svelte'
  import BucketTreeItemCardButton from '$components/BucketTreeItemCardButton.svelte'
  import BucketTreeItemLegend from './BucketTreeItemLegend.svelte'
  import BucketTreeLabel from './BucketTreeLabel.svelte'
  import BucketTreeItemIcon from './BucketTreeItemIcon.svelte'

  import { modalVisible, indicatorProgress } from '$stores'
  import { fetchUrl } from '$lib/helper'

  export let tree: TreeNode

  let isAddLayerModalVisible = false
  $: {
    $modalVisible = isAddLayerModalVisible
  }

  const loadLayer = async () => {
    if (tree.isRaster) throw new Error('This component can only be used for vector type')
    $indicatorProgress = true

    if (!tree.isRaster) {
      tree.metadata = await getVectorMetadata(tree)

      isAddLayerModalVisible = true
    }

    setTimeout(function () {
      $indicatorProgress = false
    }, 350)
  }

  const getVectorMetadata = async (node: TreeNode) => {
    let data: VectorTileMetadata
    if (!node.dynamicSourceType) {
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

      let vector_layers: VectorLayerMetadata[] = tilejson.vector_layers

      const tilestatsLayer: VectorLayerTileStatLayer = {
        layer: node.path,
        geometry: node.geomType,
        count: null,
        attributeCount: null,
        attributes: null,
      }

      data.json = {
        vector_layers: vector_layers,
        tilestats: {
          layerCount: 1,
          layers: [tilestatsLayer],
        },
      }
    }
    return data
  }
</script>

<BucketTreeItemIcon on:addLayer={loadLayer}>
  <!-- The modal is located here so the focus is set to ne next element -->
  <AddLayerModal
    bind:isModalVisible={isAddLayerModalVisible}
    treeNode={tree} />
</BucketTreeItemIcon>
<BucketTreeLabel bind:tree />
<BucketTreeItemCardButton bind:tree />
<BucketTreeItemLegend bind:tree />
