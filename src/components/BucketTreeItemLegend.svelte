<script lang="ts">
  import { onMount } from 'svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
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
  <div
    class="icon"
    alt={iconRaster.label}
    title={iconRaster.label}>
    <Wrapper>
      <i
        class="{iconRaster.icon} sm fa-rotate-by"
        style="--fa-rotate-angle:140deg; color:{iconRaster.color};" />
      <Tooltip
        showDelay={0}
        hideDelay={100}
        yPos="above">Raster</Tooltip>
    </Wrapper>
  </div>
{:else}
  <div
    class="icon"
    alt={iconVector.label}
    title={iconVector.label}>
    <Wrapper>
      <i
        class="{iconVector.icon} sm"
        style="color:{iconVector.color};" />
      <Tooltip
        showDelay={500}
        hideDelay={100}
        yPos="above">Vector</Tooltip>
    </Wrapper>
  </div>
{/if}

<style lang="scss">
  .icon {
    padding-left: 10px;
    padding-right: 10px;
  }
</style>
