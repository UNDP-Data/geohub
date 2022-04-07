<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Dialog, { Title, Content as ContentDialog, Actions as ActionsDialog } from '@smui/dialog'
  import Textfield from '@smui/textfield'
  import Select, { Option } from '@smui/select'
  import { v4 as uuidv4 } from 'uuid'
  import type {
    LineLayerSpecification,
    FillLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import { cloneDeep } from 'lodash'

  import { LayerTypes } from '../../lib/constants'
  import { map, layerList } from '../../stores'

  export let SelectLayerStyleDialogVisible = false
  export let path: string
  export let url: string
  export let label: string
  let tileSourceId = path
  let layerTypes = [LayerTypes.SYMBOL, LayerTypes.LINE, LayerTypes.FILL]
  let layerType = LayerTypes.LINE

  const addLayer = () => {
    if (!$map.getSource(tileSourceId)) {
      const layerSource = {
        type: LayerTypes.VECTOR,
        tiles: [url],
      }
      if (!(tileSourceId in $map.getStyle().sources)) {
        $map.addSource(tileSourceId, layerSource)
      }
    }
    const layerId = uuidv4()
    let layerDefinition: LineLayerSpecification | FillLayerSpecification | SymbolLayerSpecification
    switch (layerType) {
      case 'symbol':
        layerDefinition = {
          id: layerId,
          type: layerType,
          source: tileSourceId,
          'source-layer': label,
          layout: {
            visibility: 'visible',
            'icon-image': 'circle',
            'icon-size': 0.8,
          },
        }
        break
      case 'line':
        layerDefinition = {
          id: layerId,
          type: layerType,
          source: tileSourceId,
          'source-layer': label,
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
      case 'fill':
        layerDefinition = {
          id: layerId,
          type: layerType,
          source: tileSourceId,
          'source-layer': label,
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
      default:
        return
    }

    const layerName = path.split('/')[path.split('/').length - 2]
    $layerList = [
      { name: layerName, definition: layerDefinition, type: LayerTypes.VECTOR, visible: true },
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

<Dialog bind:open={SelectLayerStyleDialogVisible} surface$style="width: 400px; height: 300px">
  <Title>Add layer</Title>
  <ContentDialog>
    <Textfield bind:value={label} label="Source layer" />
    <br />
    <Select bind:value={layerType} label="Layer type">
      {#each layerTypes as type}
        <Option value={type}>{type}</Option>
      {/each}
    </Select>
  </ContentDialog>
  <ActionsDialog>
    <Button>
      <LabelButton class="button">Cancel</LabelButton>
    </Button>
    <Button on:click={() => addLayer()}>
      <LabelButton class="button">Add</LabelButton>
    </Button>
  </ActionsDialog>
</Dialog>

<style lang="scss">
</style>
