<script lang="ts" context="module">
  const layerState = {}
</script>

<script lang="ts">
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import Accordion, { Panel } from '@smui-extra/accordion'
  import Tab, { Label } from '@smui/tab'
  import TabBar from '@smui/tab-bar'
  import Fa from 'svelte-fa'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'
  import { faList } from '@fortawesome/free-solid-svg-icons/faList'
  import { faPenToSquare } from '@fortawesome/free-solid-svg-icons/faPenToSquare'
  import { faTag } from '@fortawesome/free-solid-svg-icons/faTag'
  import { map } from '../stores'
  import type { Layer } from '../lib/types'
  import { LayerInitialValues, LayerTypes, TabNames } from '../lib/constants'
  import LayerNameGroup from './control-groups/LayerNameGroup.svelte'
  import OpacityPanel from './controls/OpacityPanel.svelte'
  import VectorLegendPanel from './controls/VectorLegendPanel.svelte'
  import VectorStyleJsonPanel from './controls/VectorStyleJsonPanel.svelte'
  import VectorLabelPanel from './controls/VectorLabelPanel.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const style = $map.getStyle().layers.filter((layer: LayerSpecification) => layer.id === layerId)[0]

  let drawerWidth = 355
  let activeTab = ''
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
  let isLabelPanelVisible = false
  let isStyleJsonPanelVisible = false
  let panelOpen: boolean = layerState[layerId] || false
  let onStyleChange = () => undefined
  let tabs = [TabNames.LEGEND]
  if (style.type === LayerTypes.SYMBOL) {
    tabs.push(TabNames.LABEL)
  }
  tabs.push(TabNames.OPACITY)
  tabs.push(TabNames.STYLEJSON)

  $: {
    if (activeTab === '') {
      isLegendPanelVisible = false
      isLabelPanelVisible = false
      isOpacityPanelVisible = false
      isStyleJsonPanelVisible = false
    }

    if (activeTab === TabNames.LEGEND) {
      isLegendPanelVisible = !isLegendPanelVisible
      isLabelPanelVisible = false
      isOpacityPanelVisible = false
      isStyleJsonPanelVisible = false
    }

    if (activeTab === TabNames.LABEL) {
      isLegendPanelVisible = false
      isLabelPanelVisible = true
      isOpacityPanelVisible = false
      isStyleJsonPanelVisible = false
    }

    if (activeTab === TabNames.OPACITY) {
      isLegendPanelVisible = false
      isLabelPanelVisible = false
      isOpacityPanelVisible = true
      isStyleJsonPanelVisible = false
    }

    if (activeTab === TabNames.STYLEJSON) {
      isLegendPanelVisible = false
      isLabelPanelVisible = false
      isOpacityPanelVisible = false
      isStyleJsonPanelVisible = true
      onStyleChange()
    }
  }
</script>

<div class="accordion-container">
  <Accordion>
    <Panel variant="raised" bind:open={panelOpen} style="padding: 15px;">
      <div class="layer-header">
        <div>
          <LayerNameGroup {layer} />
          <div class="layer-header-icons">
            <div class="group">
              <TabBar
                {tabs}
                let:tab
                active={activeTab}
                style="width: {drawerWidth - 100}px; max-width: {drawerWidth - 100}px;">
                <Tab
                  {tab}
                  class="tab"
                  style="font-size: 9px; font-weight: normal; font-family: ProximaNova, sans-serif; height: 25px; text-transform: none; max-width: 95px;"
                  on:click={() => {
                    activeTab === tab ? (activeTab = '') : (activeTab = tab)
                  }}>
                  <Label>
                    <div class="tabs">
                      <div style="padding-right: 5px;">
                        {#if tab === TabNames.LEGEND}
                          <Fa icon={faList} size="1x" />
                        {:else if tab === TabNames.LABEL}
                          <Fa icon={faTag} size="1x" />
                        {:else if tab === TabNames.OPACITY}
                          <Fa icon={faDroplet} size="1x" />
                        {:else if tab === TabNames.STYLEJSON}
                          <Fa icon={faPenToSquare} size="1x" />
                        {/if}
                      </div>
                      <div>
                        {tab}
                      </div>
                    </div>
                  </Label>
                </Tab>
              </TabBar>
            </div>
          </div>
        </div>
        <div class="layer-actions">
          <VectorLegendPanel {layer} {isLegendPanelVisible} />
          {#if style.type === LayerTypes.SYMBOL}
            <VectorLabelPanel {layer} {isLabelPanelVisible} />
          {/if}
          <OpacityPanel {layer} {isOpacityPanelVisible} />
          <VectorStyleJsonPanel {layer} {isStyleJsonPanelVisible} bind:onStyleChange />
        </div>
      </div>
    </Panel>
  </Accordion>
</div>

<style lang="scss">
  .accordion-container {
    margin-left: 15px;
    margin-bottom: 15px;

    .layer-header {
      .layer-header-icons {
        align-items: center;
        border-top: 1px solid rgba(204, 204, 204, 0.5);
        display: flex;
        gap: 15px;
        justify-content: left;
        margin-top: 10px;
        padding-top: 10px;

        .group {
          padding-top: 5px;
          padding-bottom: 5px;

          .tabs {
            align-items: center;
            display: flex;
            flex-direction: row;
            font-family: ProximaNova, sans-serif;
            font-size: 11px;
            gap: 5px;
          }

          @media (prefers-color-scheme: dark) {
            color: white;
          }
        }
      }

      .layer-actions {
        padding-top: 5px;
      }
    }
  }
</style>
