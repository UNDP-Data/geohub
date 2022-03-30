<script lang="ts" context="module">
  const dynamicLayerIds = {}
  const layerState = {}
  const sectionState = {}
</script>

<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Dialog, { Title, Content as ContentDialog, Actions as ActionsDialog } from '@smui/dialog'
  import Fa from 'svelte-fa'
  import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'

  import { layerList, map } from '../../stores'
  import type { Layer } from '../../lib/types'
  import { LayerInitialValues } from '../../lib/constants'

  export let layer: Layer = LayerInitialValues

  const name = layer.name
  const layerId = layer.definition.id

  let confirmDeleteLayerDialogVisible = false

  const removeLayer = () => {
    hideLayerControlPanel()

    setTimeout(() => {
      $map.removeLayer(layerId)
      $layerList = $layerList.filter((item) => item.definition.id !== layerId)
      delete layerState[layerId]
      delete sectionState[layerId]
      delete dynamicLayerIds[layerId]
    }, 200)
  }
  const hideLayerControlPanel = () => {
    confirmDeleteLayerDialogVisible = false
  }
</script>

<div class="container icon-selected" title="Delete layer" on:click={() => (confirmDeleteLayerDialogVisible = true)}>
  <Fa icon={faTrash} size="1x" />
</div>

<Dialog bind:open={confirmDeleteLayerDialogVisible}>
  <Title>Delete Layer</Title>
  <ContentDialog>
    Are you sure you want to delete this layer?<br /><br />
    {name}
  </ContentDialog>
  <ActionsDialog>
    <Button>
      <LabelButton>No</LabelButton>
    </Button>
    <Button on:click={() => removeLayer()}>
      <LabelButton>Yes</LabelButton>
    </Button>
  </ActionsDialog>
</Dialog>

<style lang="scss">
  @import '../styles/button-icons-selected.scss';

  .container {
    margin-right: 0;
  }
</style>
