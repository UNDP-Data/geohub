<script lang="ts" context="module">
  const dynamicLayerIds = {}
  const layerState = {}
</script>

<script lang="ts">
  import 'bulma/css/bulma.css'
  import Accordion, { Panel } from '@smui-extra/accordion'
  import { slide } from 'svelte/transition'
  import Fa from 'svelte-fa'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter'
  import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck'
  import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { faDiagramNext } from '@fortawesome/free-solid-svg-icons/faDiagramNext'
  import { faRankingStar } from '@fortawesome/free-solid-svg-icons/faRankingStar'
  import { faBarsProgress } from '@fortawesome/free-solid-svg-icons/faBarsProgress'

  import Legend from './Legend.svelte'
  import UniqueValuesLegend from './UniqueValuesLegend.svelte'
  import IntervalsLegend from './IntervalsLegend.svelte'
  import { layerList, dynamicLayers, map } from '../stores'
  import type { Layer } from '../lib/types'
  import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import { LayerInitialValues, DynamicLayerLegendTypes, DEFAULT_COLORMAP } from '../lib/constants'
  import LayerNameGroup from './control-groups/LayerNameGroup.svelte'
  import LayerControlGroup from './control-groups/LayerControlGroup.svelte'
  import OpacityButton from './controls/OpacityButton.svelte'
  import OpacityPanel from './controls/OpacityPanel.svelte'

  export let layer: Layer = LayerInitialValues
  export let disabled = true

  const layerId = layer.definition.id
  const mapLayers = $map.getStyle().layers
  const layerUniqueValues = layer.info['band_metadata'][0][1]['STATISTICS_UNIQUE_VALUES'].sort()
  let mapLayerIndex: number

  let isDynamicLayer: boolean = dynamicLayerIds[layerId] || false
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

  let legendTypes = { continuous: faDiagramNext }
  if (layerUniqueValues.length > 0) {
    legendTypes = { ...legendTypes, ...{ unique: faRankingStar } }
  } else {
    legendTypes = { ...legendTypes, ...{ intervals: faBarsProgress } }
  }

  let selectedLegendType = DynamicLayerLegendTypes.CONTINUOUS.toString()
  let activeColorMapName: string = DEFAULT_COLORMAP

  $: isDynamicLayer, setDynamicLayerState()
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

  const debounce = (fn) => {
    clearTimeout(timer)
    timer = setTimeout(fn, 500)
  }

  const setDynamicLayerState = () => {
    dynamicLayerIds[layerId] = isDynamicLayer

    if (isDynamicLayer === true) {
      if (!$dynamicLayers.includes(layerId)) {
        dynamicLayers.set([...$dynamicLayers, layerId])
      }
    } else {
      $dynamicLayers = $dynamicLayers.filter((dynamicLayerId) => dynamicLayerId !== layerId)
    }

    let ntrue = 0

    for (const [value] of Object.entries(dynamicLayerIds)) {
      if (value) {
        ++ntrue
      }
      if (ntrue >= 2) {
        disabled = false
        break
      } else {
        disabled = true
      }
    }
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

  import Tab, { Label } from '@smui/tab'
  import TabBar from '@smui/tab-bar'
  const legendTypeLabels = Object.keys(legendTypes)
</script>

<div class="accordion-container" style="margin-left: 15px; margin-bottom: 15px;">
  <Accordion>
    <Panel variant="raised" bind:open={panelOpen} style="padding: 15px;">
      <div class="layer-header">
        <div>
          <LayerNameGroup {mapLayerIndex} {layer} />
          <div class="layer-header-icons">
            <!-- GROUP : EDIT OPTIONS-->
            <div class="group">
              <div
                class={isLegendPanelVisible ? 'icon-selected' : 'icon'}
                on:click={() => {
                  isLegendPanelVisible = !isLegendPanelVisible
                  isFilterPanelVisible = false
                  isOpacityPanelVisible = false
                }}>
                <Fa icon={faPalette} size="1x" />
              </div>

              <div
                class={isFilterPanelVisible ? 'icon-selected' : 'icon'}
                on:click={() => {
                  isFilterPanelVisible = !isFilterPanelVisible
                  isLegendPanelVisible = false
                  isOpacityPanelVisible = false
                }}>
                <Fa icon={faFilter} size="1x" />
              </div>

              <OpacityButton bind:isOpacityPanelVisible />
            </div>

            <!-- GROUP : NON-EDIT ACTIONS -->
            {#if $layerList.length > 1}
              <div class="group">
                <div
                  title="Layer Merge"
                  class="icon-selected"
                  on:click={() => (isDynamicLayer = !isDynamicLayer)}
                  style="margin-right: 8px; margin-left: 3px;">
                  <Fa icon={isDynamicLayer ? faSquareCheck : faSquare} size="1x" />
                </div>
              </div>
            {/if}

            <!-- GROUP : LAYER CONTROL ACTIONS -->
            <LayerControlGroup bind:mapLayerIndex {layer} />
          </div>
        </div>

        <div class="layer-actions">
          {#if isLegendPanelVisible === true}
            <div transition:slide class="action">
              <div class="header">
                <div class="name">Legend</div>
                <div class="close icon-selected" on:click={() => (isLegendPanelVisible = false)} title="Close">
                  <Fa icon={faXmark} size="lg" />
                </div>
              </div>
              <div class="content">
                <div class="tab-bar">
                  <TabBar tabs={legendTypeLabels} let:tab style="" active={legendTypeLabels[0]}>
                    <Tab
                      {tab}
                      class="tab"
                      style="font-size: 9px; font-weight: normal; font-family: ProximaNova, sans-serif; height: 25px;"
                      on:click={() => (selectedLegendType = tab)}>
                      <Label
                        style="font-size: 9px; text-transform: none; font-weight: normal; font-family: ProximaNova, sans-serif;">
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </Label>
                    </Tab>
                  </TabBar>
                </div>

                <div hidden={selectedLegendType !== DynamicLayerLegendTypes.CONTINUOUS}>
                  <Legend bind:activeColorMapName layerConfig={layer} />
                </div>

                <div hidden={selectedLegendType !== DynamicLayerLegendTypes.UNIQUE}>
                  <UniqueValuesLegend bind:activeColorMapName layerConfig={layer} />
                </div>

                <div hidden={selectedLegendType !== DynamicLayerLegendTypes.INTERVALS}>
                  <IntervalsLegend bind:activeColorMapName layerConfig={layer} />
                </div>
              </div>
            </div>{/if}

          {#if isFilterPanelVisible === true}
            <div class="action">
              <div class="header">
                <div class="name">Filter</div>
                <div class="close icon-selected" on:click={() => (isFilterPanelVisible = false)} title="Close">
                  <Fa icon={faXmark} size="lg" />
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
  .layer-header {
    .layer-header-icons {
      padding-top: 10px;
      display: flex;
      justify-content: left;
      align-items: center;
      gap: 15px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(204, 204, 204, 0.5);

      .group {
        background: #e3e3e3;
        border-radius: 7.5px;
        padding: 5px;
        padding-right: 0;

        @media (prefers-color-scheme: dark) {
          background: #323234;
          color: white;
        }

        .icon {
          opacity: 0.5;
          display: inline;
          cursor: pointer;
          margin-right: 10px;

          &:hover {
            opacity: 1;
          }
        }

        .icon-selected {
          opacity: 1;
          display: inline;
          cursor: pointer;
          margin-right: 10px;
        }
      }
    }

    .layer-actions {
      margin-top: 10px;
      border-top: 1px solid rgba(204, 204, 204, 0.5);

      .action {
        margin-bottom: 25px;

        .header {
          display: flex;
          justify-content: left;
          align-items: center;
          margin-top: 15px;
          background: #e3e3e3;
          border-radius: 7.5px;
          padding: 2.5px;
          padding-left: 7.5px;
          margin-bottom: 10px;

          @media (prefers-color-scheme: dark) {
            background: #323234;
            border-color: #30363d;
            color: white;
          }

          .name {
            width: 100%;
          }

          .close {
            cursor: pointer;
            padding-right: 5px;
          }
        }

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
