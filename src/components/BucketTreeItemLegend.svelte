<script lang="ts">
  import { onMount } from 'svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'

  import type { TreeNode } from '$lib/types'
  import { LayerIconTypes, LayerTypes } from '$lib/constants'

  export let tree: TreeNode

  const iconRaster = LayerIconTypes.find((icon) => icon.id === LayerTypes.RASTER)

  let iconVector = LayerIconTypes.find((icon) => icon.id === LayerTypes.VECTOR)

  onMount(() => {
    if (tree.geomType) {
      iconVector = getVectorLayerIcon(tree.geomType)
    }
  })

  const getVectorLayerIcon = (layerGeomType: string) => {
    return LayerIconTypes.find((icon) => layerGeomType.toLowerCase().includes(icon.id))
  }
</script>

{#if tree.isRaster}
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

<style lang="scss">
  .icon {
    padding-left: 10px;
    padding-right: 10px;
  }
</style>
