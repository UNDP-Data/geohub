<script lang="ts" context="module">
  const layerState = {}
</script>

<script lang="ts">
  import 'bulma/css/bulma.css'
  import Accordion, { Panel } from '@smui-extra/accordion'
  import Fa from 'svelte-fa'
  import { faCalculator } from '@fortawesome/free-solid-svg-icons/faCalculator'
  import { faRetweet } from '@fortawesome/free-solid-svg-icons/faRetweet'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'
  import { faList } from '@fortawesome/free-solid-svg-icons/faList'
  import Tab, { Label } from '@smui/tab'
  import TabBar from '@smui/tab-bar'

  import Legend from './Legend.svelte'
  import IntervalsLegend from './IntervalsLegend.svelte'
  import { layerList, map } from '../stores'
  import type { Layer } from '../lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, DynamicLayerLegendTypes, DEFAULT_COLORMAP, TabNames } from '../lib/constants'
  import LayerNameGroup from './control-groups/LayerNameGroup.svelte'
  import OpacityPanel from './controls/OpacityPanel.svelte'

  export let layer: Layer = LayerInitialValues

  const layerId = layer.definition.id
  const mapLayers = $map.getStyle().layers

  let activeColorMapName: string = DEFAULT_COLORMAP
  let activeTab = ''
  let isFilterPanelVisible = false
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
  let layerBandMetadataMax = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  let layerBandMetadataMin = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  let panelOpen: boolean = layerState[layerId] || false
  let scalingValueRange = ''
  let scalingValueStart = Math.floor(+layerBandMetadataMin * 10) / 10
  let scalingValueEnd = Math.ceil(+layerBandMetadataMax * 10) / 10
  let timer: ReturnType<typeof setTimeout>
  let selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS.toString()

  $: panelOpen, setLayerState()
  $: scalingValueStart, setScalingValueRange()
  $: scalingValueEnd, setScalingValueRange()
  $: scalingValueRange, selectScaling()
  $: if (isOpacityPanelVisible !== false) {
    isLegendPanelVisible = false
    isFilterPanelVisible = false
  }

  $: {
    const layer = $layerList.some((item) => item.definition.id === layerId)
    if (!layer) hideAllPanels()
  }

  $: {
    if (activeTab === '') {
      isLegendPanelVisible = false
      isFilterPanelVisible = false
      isOpacityPanelVisible = false
    }

    if (activeTab === TabNames.LEGEND) {
      isLegendPanelVisible = !isLegendPanelVisible
      isFilterPanelVisible = false
      isOpacityPanelVisible = false
    }

    if (activeTab === TabNames.REFINE) {
      isFilterPanelVisible = !isFilterPanelVisible
      isLegendPanelVisible = false
      isOpacityPanelVisible = false
    }

    if (activeTab === TabNames.OPACITY) {
      isFilterPanelVisible = false
      isLegendPanelVisible = false
      isOpacityPanelVisible = true
    }
  }

  const debounce = (fn) => {
    clearTimeout(timer)
    timer = setTimeout(fn, 500)
  }

  const setLayerState = () => {
    layerState[layerId] = panelOpen
  }

  const hideAllPanels = () => {
    isLegendPanelVisible = false
    isOpacityPanelVisible = false
    isFilterPanelVisible = false
  }

  const updateParamsInURL = (params: Record<string, string>) => {
    debounce(() => {
      let layers = mapLayers.find((item: LayerSpecification) => item.id === layerId)['source']
      const layerSource = $map.getSource(layers)

      if (layerSource.tiles) {
        const oldUrl = new URL(layerSource.tiles[0])
        Object.keys(params).forEach((key) => {
          oldUrl.searchParams.set(key, params[key])
        })
        $map.getSource(layers).tiles = [decodeURI(oldUrl.toString())]
        $map.style.sourceCaches[layers].clearTiles()
        $map.style.sourceCaches[layers].update($map.transform)
        $map.triggerRepaint()
      }
    })
  }

  const selectScaling = () => {
    if (!scalingValueRange) return
    updateParamsInURL({ rescale: scalingValueRange })
  }

  const setScalingValueRange = () => {
    scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  }

  import Tooltip, { Wrapper } from '@smui/tooltip'
  let isLegendAnimate = false
</script>

<div class="accordion-container" style="margin-left: 15px; margin-bottom: 15px;">
  <Accordion style="z-index: inherit;">
    <Panel variant="raised" bind:open={panelOpen} style="padding: 15px;">
      <div class="layer-header">
        <div>
          <LayerNameGroup {layer} />
          <div class="layer-header-icons">
            <div class="group">
              <TabBar tabs={[TabNames.LEGEND, TabNames.REFINE, TabNames.OPACITY]} let:tab active={activeTab}>
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
                        {:else if tab === TabNames.REFINE}
                          <Fa icon={faCalculator} size="1x" />
                        {:else if tab === TabNames.OPACITY}
                          <Fa icon={faDroplet} size="1x" />
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
          {#if isLegendPanelVisible === true}
            <div class="action">
              <div class="content">
                <div style="margin-bottom: 10px;">
                  <Wrapper>
                    <div
                      style="cursor: pointer; width: 20px;  margin-left: auto;"
                      on:click={() => {
                        isLegendAnimate = true
                        setTimeout(() => {
                          isLegendAnimate = false
                        }, 400)

                        selectedLegendType === DynamicLayerLegendTypes.INTERVALS
                          ? (selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS)
                          : (selectedLegendType = DynamicLayerLegendTypes.INTERVALS)
                      }}>
                      <Fa icon={faRetweet} size="1x" spin={isLegendAnimate} />
                    </div>
                    <Tooltip showDelay={300} hideDelay={100} yPos="above">
                      {selectedLegendType === DynamicLayerLegendTypes.INTERVALS
                        ? 'Show Continous Legend'
                        : 'Show Intervals Legend'}
                    </Tooltip>
                  </Wrapper>
                </div>

                <div class="scene scene--card">
                  <div class={`card ${selectedLegendType === DynamicLayerLegendTypes.INTERVALS ? 'is-flipped' : ''}`}>
                    <div class="card__face card__face--front">
                      <div style="border: 1px solid #ccc; padding: 5px;">
                        <Legend bind:activeColorMapName layerConfig={layer} />
                      </div>
                    </div>
                    <div class="card__face card__face--back">
                      <div style="border: 1px solid #ccc; padding: 5px;">
                        <IntervalsLegend bind:activeColorMapName layerConfig={layer} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/if}
          <OpacityPanel {layer} {isOpacityPanelVisible} />
        </div>
      </div></Panel>
  </Accordion>
</div>

<style lang="scss">
  .scene {
    min-height: 320px;

    .card {
      cursor: pointer;
      height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 1s;
      width: 100%;

      &.is-flipped {
        transform: rotateY(180deg);
      }
    }

    .card__face {
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      height: 100%;
      position: absolute;
      width: 100%;
    }

    .card__face--back {
      transform: rotateY(180deg);
    }
  }

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

      .action {
        margin-bottom: 25px;

        .content {
          padding: 5px 15px 5px 15px;

          .tab-bar {
            margin-bottom: 20px;
          }
        }
      }
    }
  }
</style>
