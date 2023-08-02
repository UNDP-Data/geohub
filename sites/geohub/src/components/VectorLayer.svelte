<script lang="ts">
  import { fade } from 'svelte/transition'
  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import VectorLegend from '$components/controls/VectorLegend.svelte'
  import VectorLabelPanel from '$components/controls/VectorLabelPanel.svelte'
  import type { Layer } from '$lib/types'
  import VectorFilter from './controls/VectorFilter.svelte'
  import { Tabs, Loader } from '@undp-data/svelte-undp-design'
  import VectorParamsPanel from './controls/VectorParamsPanel.svelte'
  import { LegendTypes, TabNames, VectorApplyToTypes } from '$lib/config/AppConfig'
  import { getLayerSourceUrl, loadArgumentsInDynamicLayers, loadMap } from '$lib/helper'
  import { map } from '$stores'

  export let layer: Layer

  let applyToOption: VectorApplyToTypes = VectorApplyToTypes.COLOR
  let legendType: LegendTypes
  let defaultColor: string
  let defaultLineColor: string
  let activeTab = TabNames.LEGEND

  let tabs = [
    { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
    { label: TabNames.FILTER, icon: 'fa-solid fa-filter' },
    { label: TabNames.LABEL, icon: 'fa-solid fa-text-height' },
    { label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' },
    { label: TabNames.SIMULATION, icon: 'fa-solid fa-person-circle-question' },
  ]

  const layerType = layer?.dataset?.properties?.tags?.find((t) => t.key == 'layertype')?.['value']

  const init = async () => {
    if (!layerType || layerType !== 'function') {
      tabs = tabs.filter((t) => t.label !== TabNames.SIMULATION)
      return
    }
    const isLoaded = await loadMap($map)
    const args = await loadArgumentsInDynamicLayers(getLayerSourceUrl($map, layer.id) as string)
    console.log(args)
    if (Object.keys(args)?.length < 1) {
      tabs = tabs.filter((t) => t.label !== TabNames.SIMULATION)
    }
    return isLoaded
  }
</script>

<div
  class="vector-layer-container"
  transition:fade|global
  data-testid="vector-layer-view-container">
  <nav class="panel">
    <p class="panel-heading has-background-grey-lighter p-2">
      <LayerNameGroup {layer} />
    </p>
    {#await init()}
      <div class="loader-container">
        <Loader size="small" />
      </div>
    {:then}
      <Tabs
        bind:tabs
        bind:activeTab
        fontSize={tabs.find((t) => t.label === TabNames.SIMULATION) ? 'small' : 'medium'}
        isToggleTab={true} />

      <p class="panel-content">
        {#if activeTab === TabNames.LEGEND}
          <VectorLegend
            {layer}
            bind:applyToOption
            bind:legendType
            bind:defaultColor
            bind:defaultLineColor />
        {:else if activeTab === TabNames.FILTER}
          <VectorFilter {layer} />
        {:else if activeTab === TabNames.LABEL}
          <VectorLabelPanel {layer} />
        {:else if activeTab === TabNames.OPACITY}
          <OpacityPanel {layer} />
        {:else if activeTab === TabNames.SIMULATION}
          <VectorParamsPanel layerId={layer.id} />
        {/if}
      </p>
    {/await}
  </nav>
</div>

<style lang="scss">
  .vector-layer-container {
    .panel-content {
      padding: 10px;
      padding-top: 15px;
    }
  }

  .loader-container {
    display: flex;
    align-items: center;
    width: fit-content;
    margin: 0 auto;
  }
</style>
