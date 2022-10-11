<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import FaLayers from 'svelte-fa/src/fa-layers.svelte'
  import { faSync } from '@fortawesome/free-solid-svg-icons/faSync'
  import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup'
  import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'

  const dispatch = createEventDispatcher()

  export let isLoading = false

  const addLayer = () => {
    dispatch('addLayer')
  }
</script>

<div>
  <a class="icon-button" href="#" role="button" on:click={addLayer}>
    {#if isLoading === true}
      <Fa icon={faSync} size="sm" spin />
    {:else}
      <Wrapper>
        <FaLayers size="sm" style="cursor: pointer;">
          <Fa icon={faLayerGroup} scale={1} />
          <Fa icon={faPlus} scale={0.8} translateY={0.4} translateX={0.5} style="color:black" />
        </FaLayers>
        <Tooltip showDelay={500} hideDelay={100} yPos="above">Add Layer</Tooltip>
      </Wrapper>
    {/if}
  </a>
  <slot />
</div>

<style lang="scss">
  .icon-button {
    color: gray;
    cursor: pointer;
  }
</style>
