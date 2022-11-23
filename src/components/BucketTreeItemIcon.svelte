<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import Fa from 'svelte-fa'
  import FaLayers from 'svelte-fa/src/fa-layers.svelte'
  import { faLayerGroup } from '@fortawesome/free-solid-svg-icons/faLayerGroup'
  import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus'
  import { indicatorProgress } from '$stores'

  $: showProgress = $indicatorProgress

  const dispatch = createEventDispatcher()

  const addLayer = () => {
    if (showProgress === true) return
    dispatch('addLayer')
  }
</script>

<div>
  <div
    class="icon-button"
    on:click={addLayer}>
    <Wrapper>
      <FaLayers
        size="sm"
        style="cursor: pointer;">
        <Fa
          icon={faLayerGroup}
          scale={1} />
        {#if showProgress !== true}
          <Fa
            icon={faPlus}
            scale={0.8}
            translateY={0.4}
            translateX={0.5}
            style="color:black" />
        {/if}
      </FaLayers>
      <Tooltip
        showDelay={500}
        hideDelay={100}
        xPos="start">Add Layer</Tooltip>
    </Wrapper>
  </div>
  <slot />
</div>

<style lang="scss">
  .icon-button {
    color: gray;
    cursor: pointer;
  }
</style>
