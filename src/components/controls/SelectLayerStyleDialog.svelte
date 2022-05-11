<script lang="ts">
  import Autocomplete from '@smui-extra/autocomplete'
  import Button, { Label as LabelButton } from '@smui/button'
  import Dialog, { Title, Content as ContentDialog, Actions as ActionsDialog } from '@smui/dialog'
  import FormField from '@smui/form-field'
  import Radio from '@smui/radio'
  import { v4 as uuidv4 } from 'uuid'
  import type {
    LineLayerSpecification,
    FillLayerSpecification,
    SymbolLayerSpecification,
    HeatmapLayerSpecification,
    VectorSourceSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import { cloneDeep, find } from 'lodash-es'

  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { LayerTypes } from '$lib/constants'
  import type { TreeNode } from '$lib/types'
  import { map, layerList } from '$stores'

  export let SelectLayerStyleDialogVisible = false
  export let tree: TreeNode

  let layerIdList: string[]
  let layerType = LayerTypes.LINE
  let layerTypes = []
  let selectedLayerId: string | undefined = tree.label
  let tileSourceId = tree.path

  $: SelectLayerStyleDialogVisible, init()
  $: selectedLayerId, setLayerTypeList()
  $: layerIdList, setLayerTypeList()

  const init = async () => {
    if (SelectLayerStyleDialogVisible !== true) return
    const vector_layers = tree.metadata.json.vector_layers
    layerIdList = vector_layers.map((l) => {
      return l.id
    })
  }

  const getLayerTypeFromGeomType = (geomType: string) => {
    if (geomType.toLowerCase().includes('point')) return LayerTypes.SYMBOL
    if (geomType.toLowerCase().includes('linestring')) return LayerTypes.LINE
    if (geomType.toLowerCase().includes('polygon')) return LayerTypes.FILL
    if (geomType.toLowerCase().includes('multipoint')) return LayerTypes.SYMBOL
    if (geomType.toLowerCase().includes('multilinestring')) return LayerTypes.LINE
    if (geomType.toLowerCase().includes('multipolygon')) return LayerTypes.FILL
  }

  const setLayerTypeList = () => {
    if (selectedLayerId && tree.metadata) {
      const tilestats = tree.metadata.json.tilestats
      if (tilestats) {
        const layer = tilestats.layers.find((layer) => layer.layer == selectedLayerId)
        if (layer) {
          const type = getLayerTypeFromGeomType(layer.geometry)
          switch (type) {
            case LayerTypes.LINE:
            case LayerTypes.FILL:
              layerTypes = [
                {
                  type: LayerTypes.LINE,
                  label: 'Line',
                },
                {
                  type: LayerTypes.FILL,
                  label: 'Polygon',
                },
                {
                  type: LayerTypes.SYMBOL,
                  label: 'Symbol',
                },
              ]
              break
            case LayerTypes.SYMBOL:
              layerTypes = [
                {
                  type: LayerTypes.SYMBOL,
                  label: 'Symbol',
                },
                {
                  type: LayerTypes.HEATMAP,
                  label: 'Heatmap',
                },
              ]
              break
            default:
              break
          }
          layerType = type
          return
        }
      }
    }
    layerTypes = [
      {
        type: LayerTypes.LINE,
        label: 'Line',
      },
      {
        type: LayerTypes.FILL,
        label: 'Polygon',
      },
      {
        type: LayerTypes.SYMBOL,
        label: 'Symbol',
      },
      {
        type: LayerTypes.HEATMAP,
        label: 'Heatmap',
      },
    ]
    layerType = LayerTypes.LINE
  }

  const addLayer = async () => {
    if (!$map.getSource(tileSourceId)) {
      const layerSource: VectorSourceSpecification = {
        type: LayerTypes.VECTOR,
        tiles: [tree.url],
        minzoom: tree.metadata.minzoom | 0,
        maxzoom: tree.metadata.maxzoom | 24,
      }
      if (!(tileSourceId in $map.getStyle().sources)) {
        $map.addSource(tileSourceId, layerSource)
      }
    }
    const layerId = `${selectedLayerId}-${uuidv4()}`
    let layerDefinition:
      | LineLayerSpecification
      | FillLayerSpecification
      | SymbolLayerSpecification
      | HeatmapLayerSpecification
    switch (layerType) {
      case LayerTypes.SYMBOL:
        layerDefinition = {
          id: layerId,
          type: layerType,
          source: tileSourceId,
          'source-layer': selectedLayerId,
          layout: {
            visibility: 'visible',
            'icon-image': 'circle',
            'icon-size': 0.8,
          },
        }
        break
      case LayerTypes.LINE:
        layerDefinition = {
          id: layerId,
          type: layerType,
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
      case LayerTypes.FILL:
        layerDefinition = {
          id: layerId,
          type: layerType,
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
      case LayerTypes.HEATMAP:
        layerDefinition = {
          id: layerId,
          type: layerType,
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

    const layerName = tree.path.split('/')[tree.path.split('/').length - 2]
    $layerList = [
      {
        name: layerName,
        definition: layerDefinition,
        type: LayerTypes.VECTOR,
        info: tree.metadata,
        visible: true,
        url: tree.url,
      },
      ...$layerList,
    ]

    $map.addLayer(layerDefinition)

    // set layer list features properties to diplay in query panel info
    $map.on('click', layerDefinition.id, function (e) {
      const layer = $layerList.find((layer) => layer.definition.id == layerDefinition.id)
      if (layer) {
        const layerClone = cloneDeep(layer)
        layerClone.features = e.features.length > 0 ? e.features[0].properties : []
        const layerIndex = $layerList.findIndex((layer) => layer.definition.id === layerDefinition.id)
        $layerList[layerIndex] = layerClone
      }
    })
  }
</script>

<Dialog bind:open={SelectLayerStyleDialogVisible} surface$style="width: 430px; height: 300px">
  <Title>Add Layer</Title>
  <ContentDialog>
    <Autocomplete combobox options={layerIdList} bind:value={selectedLayerId} label="Layer ID" />
    <StyleControlGroup title={'Type'}>
      <div class="layer-type">
        {#each layerTypes as type}
          <FormField>
            <Radio bind:group={layerType} value={type.type} />
            <span slot="label">
              {type.label}
            </span>
          </FormField>
        {/each}
      </div>
    </StyleControlGroup>
  </ContentDialog>
  <ActionsDialog>
    <Button>
      <LabelButton>Cancel</LabelButton>
    </Button>
    {#if selectedLayerId && layerIdList && layerIdList.includes(selectedLayerId)}
      <Button on:click={() => addLayer()}>
        <LabelButton>Add</LabelButton>
      </Button>
    {/if}
  </ActionsDialog>
</Dialog>

<style lang="scss">
  .layer-type {
    align-items: left;
    flex-direction: row;
    gap: 10px;
    display: flex;
  }
</style>
