<script lang="ts">
  import { fade } from 'svelte/transition'
  import Fa from 'svelte-fa'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'
  import { faList } from '@fortawesome/free-solid-svg-icons/faList'
  import { faPenToSquare } from '@fortawesome/free-solid-svg-icons/faPenToSquare'
  import { faTag } from '@fortawesome/free-solid-svg-icons/faTag'
  import { faMagnifyingGlassLocation } from '@fortawesome/free-solid-svg-icons/faMagnifyingGlassLocation'

  import LayerNameGroup from '$components/control-groups/LayerNameGroup.svelte'
  import OpacityPanel from '$components/controls/OpacityPanel.svelte'
  import VectorLegendPanel from '$components/controls/VectorLegendPanel.svelte'
  import VectorStyleJsonPanel from '$components/controls/VectorStyleJsonPanel.svelte'
  import VectorLabelPanel from '$components/controls/VectorLabelPanel.svelte'
  import ZoomLevelPanel from '$components/controls/ZoomLevelPanel.svelte'
  import { LayerInitialValues, TabNames } from '$lib/constants'
  import type { Layer } from '$lib/types'

  export let layer: Layer = LayerInitialValues

  let activeTab = ''
  let isLabelPanelVisible = false
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
  let isStyleJsonPanelVisible = false
  let isZoomLevelPanelVisible = false
  let onStyleChange = () => undefined

  let tabs = [
    { label: TabNames.LEGEND, icon: faList, active: false },
    { label: TabNames.OPACITY, icon: faDroplet, active: false },
    { label: TabNames.LABEL, icon: faTag, active: false },
    { label: TabNames.ZOOM, icon: faMagnifyingGlassLocation, active: false },
    { label: TabNames.STYLEJSON, icon: faPenToSquare, active: false },
  ]

  $: {
    isLegendPanelVisible = false
    isLabelPanelVisible = false
    isOpacityPanelVisible = false
    isStyleJsonPanelVisible = false
    isZoomLevelPanelVisible = false

    switch (activeTab) {
      case TabNames.LEGEND:
        isLegendPanelVisible = true
        break
      case TabNames.LABEL:
        isLabelPanelVisible = true
        break
      case TabNames.OPACITY:
        isOpacityPanelVisible = true
        break
      case TabNames.ZOOM:
        isZoomLevelPanelVisible = true
        break
      case TabNames.STYLEJSON:
        isStyleJsonPanelVisible = true
        onStyleChange()
        break
      default:
        break
    }
  }
</script>

<div class="vector-layer-container" transition:fade>
  <nav class="panel">
    <p class="panel-heading">
      <LayerNameGroup {layer} />
    </p>
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

    <p class="panel-content">
      <VectorLegendPanel {layer} {isLegendPanelVisible} />
      <VectorLabelPanel {layer} {isLabelPanelVisible} />
      <OpacityPanel {layer} {isOpacityPanelVisible} />
      <ZoomLevelPanel {layer} {isZoomLevelPanelVisible} />
      <VectorStyleJsonPanel {layer} {isStyleJsonPanelVisible} bind:onStyleChange />
    </p>
  </nav>
</div>

<style lang="scss">
  @import '../styles/bulma.css';

  .vector-layer-container {
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
      padding: 25px;
    }
  }
</style>
