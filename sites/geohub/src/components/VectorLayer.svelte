<script lang="ts">
  import { fade } from 'svelte/transition'
  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import VectorLegendPanel from '$components/controls/VectorLegendPanel.svelte'
  import VectorLabelPanel from '$components/controls/VectorLabelPanel.svelte'
  import { ClassificationMethodTypes, LayerInitialValues, TabNames } from '$lib/constants'
  import type { Layer } from '$lib/types'
  import VectorFilterPanelWizard from './controls/VectorFilterPanelWizard.svelte'
  import { getRandomColormap } from '$lib/helper'
  import Tabs from '$components//controls/Tabs.svelte'

  export let layer: Layer = LayerInitialValues
  let colorMapName = getRandomColormap()
  let classificationMethod: ClassificationMethodTypes
  let applyToOption: string
  let legendType: string
  let defaultColor: string = undefined
  let defaultLineColor: string = undefined

  let activeTab = ''
  let isLabelPanelVisible: boolean
  let isLegendPanelVisible: boolean
  let isOpacityPanelVisible: boolean
  let isFilterPanelVisible: boolean

  let tabs = [
    { label: TabNames.LEGEND, icon: 'fa-solid fa-list' },
    { label: TabNames.FILTER, icon: 'fa-solid fa-filter' },
    { label: TabNames.LABEL, icon: 'fa-solid fa-text-height' },
    { label: TabNames.OPACITY, icon: 'fa-solid fa-droplet' },
  ]

  $: {
    isLabelPanelVisible = false
    isLegendPanelVisible = false
    isOpacityPanelVisible = false
    isFilterPanelVisible = false
    switch (activeTab) {
      case TabNames.LEGEND:
        isLegendPanelVisible = true
        break
      case TabNames.FILTER:
        isFilterPanelVisible = true
        break
      case TabNames.LABEL:
        isLabelPanelVisible = true
        break
      case TabNames.OPACITY:
        isOpacityPanelVisible = true
        break
      default:
        break
    }
  }
</script>

<div
  class="vector-layer-container"
  transition:fade
  data-testid="vector-layer-view-container">
  <nav class="panel">
    <p class="panel-heading">
      <LayerNameGroup {layer} />
    </p>

    <Tabs
      bind:tabs
      bind:activeTab
      tabPaddingLeft={20}
      fontSize="small"
      isToggleTab={true} />

    <p class="panel-content">
      <VectorLegendPanel
        {layer}
        {isLegendPanelVisible}
        bind:colorMapName
        bind:classificationMethod
        bind:applyToOption
        bind:legendType
        bind:defaultColor
        bind:defaultLineColor />
      <VectorFilterPanelWizard
        {layer}
        {isFilterPanelVisible} />
      <VectorLabelPanel
        {layer}
        {isLabelPanelVisible} />
      <OpacityPanel
        {layer}
        {isOpacityPanelVisible} />
    </p>
  </nav>
</div>

<style lang="scss">
  .vector-layer-container {
    .panel-content {
      padding: 10px;
      padding-top: 15px;
    }
  }
</style>
