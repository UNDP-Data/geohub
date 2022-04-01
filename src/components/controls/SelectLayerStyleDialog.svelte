<!-- <script lang="ts" context="module">
    const dynamicLayerIds = {}
    const layerState = {}
    const sectionState = {}
  </script> -->
<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Dialog, { Title, Content as ContentDialog, Actions as ActionsDialog } from '@smui/dialog'
  import Textfield from '@smui/textfield'
  import Select, { Option } from '@smui/select'
  import { v4 as uuidv4 } from 'uuid'
  // import type { LayerDefinition, LayerInfo } from '../../lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerTypes } from '../../lib/constants'
  import { map, layerList } from '../../stores'

  export let SelectLayerStyleDialogVisible = false
  export let IsCanceledAddingLayer = false
  export let path
  export let url
  export let label
  let tileSourceId = path
  let layerTypes = ['symbol', 'line', 'fill']
  let layerType = 'line'

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
    let layerDefinition: LayerSpecification

    switch (layerType) {
      case 'symbol':
        return
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
  }

  const cancel = () => {
    IsCanceledAddingLayer = true
  }
</script>

<Dialog bind:open={SelectLayerStyleDialogVisible}>
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
    <Button on:click={() => cancel()}>
      <LabelButton class="button">Cancel</LabelButton>
    </Button>
    <Button on:click={() => addLayer()}>
      <LabelButton class="button">Add</LabelButton>
    </Button>
  </ActionsDialog>
</Dialog>

<style lang="scss">
  @import '../../styles/button-icons-selected.scss';

  .container {
    margin-right: 0;
  }

  .button {
    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }
</style>
