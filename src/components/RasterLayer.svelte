<script lang="ts" context="module">
  const dynamicLayerIds = {}
  const layerState = {}
  // const sectionState = {}
</script>

<script lang="ts">
  import 'bulma/css/bulma.css'
  import Accordion, { Panel } from '@smui-extra/accordion'
  import { slide } from 'svelte/transition'
  import Fa from 'svelte-fa'
  import RangeSlider from 'svelte-range-slider-pips'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'
  import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck'
  import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'

  import Legend from './Legend.svelte'
  import { layerList, dynamicLayers, map } from '../stores'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'
  import LayerName from './LayerName.svelte'
  import LayerControlPanel from './LayerControlPanel.svelte'

  export let layerConfig: Layer = LayerInitialValues
  export let disabled = true

  let definition: LayerDefinition
  ;({ definition } = layerConfig)
  const layerId = definition.id
  const layer = $layerList.filter((item) => item.definition.id === layerId).pop()
  const mapLayers = $map.getStyle().layers
  let mapLayerIndex

  // let confirmDeleteLayerDialogVisible = false
  let isDynamicLayer: boolean = dynamicLayerIds[layerId] || false
  let isFilterPanelVisible = false
  // let isLayerVisible = false
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
  let layerBandMetadataMax = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  let layerBandMetadataMin = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM'])
  let layerOpacity = 1
  let panelOpen: boolean = layerState[layerId] || false
  let queryEnabled = true
  let rangeSliderValues = [layerOpacity * 100]
  let scalingValueRange = ''

  let scalingValueStart = Math.floor(+layerBandMetadataMin * 10) / 10
  let scalingValueEnd = Math.ceil(+layerBandMetadataMax * 10) / 10
  let timer: ReturnType<typeof setTimeout>

  $: isDynamicLayer, setDynamicLayerState()
  $: layerOpacity = rangeSliderValues[0] / 100
  $: layerOpacity, setLayerOpacity()
  $: panelOpen, setLayerState()
  $: scalingValueStart, setScalingValueRange()
  $: scalingValueEnd, setScalingValueRange()
  $: scalingValueRange, selectScaling()
  // $: visibility = isLayerVisible ? 'visible' : 'none'

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

    if (isDynamicLayer == true) {
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

  const setLayerOpacity = () => {
    $map.setPaintProperty(layerId, 'raster-opacity', layerOpacity)
  }

  // const removeLayer = () => {
  //   hideAllPanels()

  //   setTimeout(() => {
  //     $map.removeLayer(layerId)
  //     $layerList = $layerList.filter((item) => item.definition.id !== layerId)
  //     isDynamicLayer = false
  //     delete layerState[layerId]
  //     delete sectionState[layerId]
  //     delete dynamicLayerIds[layerId]
  //   }, 200)
  // }

  const hideAllPanels = () => {
    isLegendPanelVisible = false
    isOpacityPanelVisible = false
    isFilterPanelVisible = false
    // confirmDeleteLayerDialogVisible = false
  }

  const updateParamsInURL = (params) => {
    debounce(() => {
      let layers = mapLayers.filter((item) => item.id === layerId).pop()['source']
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
</script>

<div class="accordion-container" style="margin-left: 15px; margin-bottom: 15px;">
  <Accordion>
    <Panel variant="raised" bind:open={panelOpen} style="padding: 15px;">
      <div class="layer-header">
        <div>
          <LayerName {mapLayerIndex} bind:layerConfig />
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

              <div
                class={isOpacityPanelVisible ? 'icon-selected' : 'icon'}
                style="margin-right: 6px;"
                on:click={() => {
                  isOpacityPanelVisible = !isOpacityPanelVisible
                  isLegendPanelVisible = false
                  isFilterPanelVisible = false
                }}>
                <Fa icon={faDroplet} size="1x" />
              </div>
            </div>

            <!-- GROUP : NON-EDIT ACTIONS -->
            {#if $layerList.length > 1}
              <div class="group">
                <div title="Query Map Info" class="icon-selected" on:click={() => (queryEnabled = !queryEnabled)}>
                  <Fa icon={queryEnabled ? faSquareCheck : faSquare} size="1x" />
                </div>

                <div title="Layer Merge" class="icon-selected" on:click={() => (isDynamicLayer = !isDynamicLayer)}>
                  <Fa icon={isDynamicLayer ? faSquareCheck : faSquare} size="1x" />
                </div>
              </div>
            {/if}

            <!-- GROUP : LAYER CONTROL ACTIONS -->
            <LayerControlPanel bind:mapLayerIndex bind:layerConfig />
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
              <Legend
                bind:layerConfig
                bind:lMax={layerBandMetadataMax}
                bind:lMin={layerBandMetadataMin}
                bind:scalingValueStart
                bind:scalingValueEnd />
            </div>
          {/if}

          {#if isFilterPanelVisible === true}
            <div transition:slide class="action">
              <div class="header">
                <div class="name">Filter</div>
                <div class="close icon-selected" on:click={() => (isFilterPanelVisible = false)} title="Close">
                  <Fa icon={faXmark} size="lg" />
                </div>
              </div>
            </div>
          {/if}

          {#if isOpacityPanelVisible === true}
            <div transition:slide class="action">
              <div class="header">
                <div class="name">Opacity</div>
                <div class="close icon-selected" on:click={() => (isOpacityPanelVisible = false)} title="Close">
                  <Fa icon={faXmark} size="lg" />
                </div>
              </div>
              <div class="slider">
                <RangeSlider
                  bind:values={rangeSliderValues}
                  float
                  min={0}
                  max={100}
                  step={1}
                  pips
                  first="label"
                  last="label"
                  rest={false}
                  suffix="%" />
              </div>
            </div>
          {/if}
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
        background: #f0f0f0;
        border-radius: 7.5px;
        padding: 5px;
        padding-right: 0;

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

        .slider {
          --range-handle-focus: #2196f3;
          --range-range-inactive: #2196f3;
          --range-handle-inactive: #2196f3;
          --range-handle: #2196f3;
        }

        .header {
          display: flex;
          justify-content: left;
          align-items: center;
          margin-top: 15px;
          background: #f0f0f0;
          border-radius: 7.5px;
          padding: 2.5px;
          padding-left: 7.5px;
          margin-bottom: 10px;

          .name {
            width: 100%;
          }

          .close {
            cursor: pointer;
            padding-right: 5px;
          }
        }
      }
    }
  }
</style>
