<script lang="ts">
  import Button, { Label as LabelButton } from '@smui/button'
  import Dialog, { Title, Content as ContentDialog, Actions as ActionsDialog } from '@smui/dialog'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'

  import { LayerInitialValues } from '$lib/constants'
  import { clean } from '$lib/helper'
  import type { Layer } from '$lib/types'
  import { layerList, map } from '$stores'

  export let layer: Layer = LayerInitialValues

  let confirmDeleteLayerDialogVisible = false

  const removeLayer = () => {
    const layerId = layer.definition.id
    confirmDeleteLayerDialogVisible = false

    setTimeout(() => {
      $layerList = $layerList.filter((item) => item.definition.id !== layerId)
      $map.removeLayer(layerId)
    }, 200)
  }
</script>

<Wrapper>
  <div class="container icon-selected" title="Delete layer" on:click={() => (confirmDeleteLayerDialogVisible = true)}>
    <Fa icon={faTrash} size="sm" />
  </div>
  <Tooltip showDelay={300} hideDelay={100} yPos="above">Delete layer</Tooltip>
</Wrapper>

<Dialog bind:open={confirmDeleteLayerDialogVisible}>
  <Title>Delete Layer</Title>
  <ContentDialog>
    Are you sure you want to delete this layer?<br /><br />
    {clean(layer.name)}
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
  @import '../../styles/button-icons-selected.scss';

  :global(.mdc-button__label) {
    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }
</style>
