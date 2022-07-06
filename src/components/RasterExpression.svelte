<script lang="ts">
  import Fa from 'svelte-fa'

  import type { Layer } from '$lib/types'
  import RefineContainer from '$components/RefineContainer.svelte'
  import RasterExpressionSimple from './RasterExpressionSimple.svelte'
  import { faThumbsUp } from '@fortawesome/free-solid-svg-icons/faThumbsUp'
  import { faMagnifyingGlassPlus } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassPlus'
  export let layer: Layer

  let activeTab = 'Simple'
  let isAdvancedPanelVisible = false
  let isSimplePanelVisible = false

  $: {
    isAdvancedPanelVisible = false
    isSimplePanelVisible = false

    switch (activeTab) {
      case 'Advanced':
        isAdvancedPanelVisible = true
        break
      case 'Simple':
        isSimplePanelVisible = true
        break

      default:
        break
    }
  }

  const tabs = [
    { label: 'Simple', icon: faThumbsUp, active: true },
    { label: 'Advanced', icon: faMagnifyingGlassPlus, active: false },
  ]
</script>

<nav class="block">
  <p class="panel-tabs">
    {#each tabs as tab}
      <a
        href={'#'}
        on:click={() => (activeTab === tab.label ? (activeTab = '') : (activeTab = tab.label))}
        class={activeTab === tab.label ? 'is-active' : ''}>
        <span>
          <Fa icon={tab.icon} size="sm" />
        </span>
        {tab.label}
      </a>
    {/each}
  </p>
  <div class="block" />
  <p>
    {#if isSimplePanelVisible === true}
      <RasterExpressionSimple {layer} />
    {/if}
    {#if isAdvancedPanelVisible}
      <RefineContainer bind:layer />
    {/if}
  </p>
</nav>

<style lang="scss">
  .raster-layer-container {
    margin-left: 15px;
    margin-bottom: 20px;

    .panel-tabs {
      padding-top: 10px;

      a {
        margin-right: 5px;

        span {
          margin-right: 3px;
        }
      }
    }

    .panel-content {
      padding: 10px;
      padding-top: 15px;
    }
  }
</style>
