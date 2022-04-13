<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Dialog, { Title, Content as ContentDialog, Actions as ActionsDialog } from '@smui/dialog'
  import FormField from '@smui/form-field'
  import Radio from '@smui/radio'
  import Textfield from '@smui/textfield'
  import { v4 as uuidv4 } from 'uuid'
  import type {
    LineLayerSpecification,
    FillLayerSpecification,
    SymbolLayerSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import { cloneDeep } from 'lodash'

  import { LayerTypes } from '../../lib/constants'
  import { map, layerList } from '../../stores'

  export let label: string
  export let path: string
  export let SelectLayerStyleDialogVisible = false
  export let url: string

  let layerType = LayerTypes.LINE
  let layerTypes = [LayerTypes.LINE, LayerTypes.SYMBOL, LayerTypes.FILL]
  let tileSourceId = path

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
  <Title>Add Layer</Title>
  <ContentDialog>
    <div>Name</div>
    <Textfield bind:value={label} style="height: 25px;" />
    <br /><br />

    <div>Types</div>
    <div>
      <div class="layer-type">
        {#each layerTypes as type}
          <FormField>
            <Radio bind:group={layerType} value={type} />
            <span slot="label">
              {type}
            </span>
          </FormField>
        {/each}
      </div>
    </div>
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
  .layer-type {
    align-items: left;
    flex-direction: row;
    gap: 10px;
    display: flex;
  }
</style>
