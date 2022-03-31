<script lang="ts" context="module">
  const layerState = {}
  const sectionState = {}
  const dynamicLayerState = {}
</script>

<script lang="ts">
  import 'bulma/css/bulma.css'
  import Button, { Label as LabelButton } from '@smui/button'
  import Checkbox from '@smui/checkbox'
  import Dialog, { Title, Content as ContentDialog, Actions as ActionsDialog } from '@smui/dialog'
  import Accordion, { Panel } from '@smui-extra/accordion'
  import { slide } from 'svelte/transition'
  import Tag from 'svelma/src/components/Tag/Tag.svelte'
  import Fa from 'svelte-fa'
  import RangeSlider from 'svelte-range-slider-pips'
  import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette'
  import { faFilter } from '@fortawesome/free-solid-svg-icons/faFilter'
  import { faDroplet } from '@fortawesome/free-solid-svg-icons/faDroplet'
  import { faSquareCheck } from '@fortawesome/free-solid-svg-icons/faSquareCheck'
  import { faSquare } from '@fortawesome/free-regular-svg-icons/faSquare'
  import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown'
  import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp'
  import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash'
  import { faEye } from '@fortawesome/free-solid-svg-icons/faEye'
  import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash'
  import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
  import { faDiagramNext } from '@fortawesome/free-solid-svg-icons/faDiagramNext'
  import { faRankingStar } from '@fortawesome/free-solid-svg-icons/faRankingStar'
  import { faBarsProgress } from '@fortawesome/free-solid-svg-icons/faBarsProgress'

  import Legend from './Legend.svelte'
  import UniqueValuesLegend from './UniqueValuesLegend.svelte'
  import IntervalsLegend from './IntervalsLegend.svelte'
  import { layerList, dynamicLayers, map } from '../stores'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues, DEFAULT_COLORMAP } from '../lib/constants'

  export let layerConfig: Layer = LayerInitialValues
  export let disabled = true

  let name: string, definition: LayerDefinition
  ;({ name, definition } = layerConfig)
  const layerId = definition.id
  const layer = $layerList.filter((item) => item.definition.id === layerId).pop()
  const mapLayers = $map.getStyle().layers
  const mapLayerByLayerId = mapLayers.filter((item: LayerDefinition) => item.id == layerId).pop()
  // check if has unique values and extract min/max from info property
  const layerUniqueValues = layer.info['band_metadata'][0][1]['STATISTICS_UNIQUE_VALUES'].sort()

  let confirmDeleteLayerDialogVisible = false
  let inDynamic: boolean = dynamicLayerState[layerId] || false
  let isFilterPanelVisible = false
  let isLayerVisible = false
  let isLegendPanelVisible = false
  let isOpacityPanelVisible = false
  let layerBandMetadataMax = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MAXIMUM'])
  let layerBandMetadataMin = parseFloat(layer.info['band_metadata'][0][1]['STATISTICS_MINIMUM'])

  let layerOpacity = 1
  let mapLayerIndex = mapLayers.indexOf(mapLayerByLayerId)
  let panelOpen: boolean = layerState[layerId] || false
  let queryEnabled = true
  let rangeSliderValues = [layerOpacity * 100]
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

  let selectedLegendType = 'continuous'
  let activeColorMapName: string = DEFAULT_COLORMAP

  $: inDynamic, setDynamicLayerState()
  $: layerOpacity = rangeSliderValues[0] / 100
  $: layerOpacity, setLayerOpacity()
  $: panelOpen, setLayerState()
  $: scalingValueStart, setScalingValueRwange()
  $: scalingValueEnd, setScalingValueRwange()
  $: scalingValueRange, selectScaling()
  $: visibility = isLayerVisible ? 'visible' : 'none'

  const debounce = (fn) => {
    clearTimeout(timer)
    timer = setTimeout(fn, 500)
  }

  const setDynamicLayerState = () => {
    dynamicLayerState[layerId] = inDynamic

    if (inDynamic == true) {
      if (!$dynamicLayers.includes(layerId)) {
        dynamicLayers.set([...$dynamicLayers, layerId])
      }
    } else {
      $dynamicLayers = $dynamicLayers.filter((dynamicLayerId) => dynamicLayerId !== layerId)
    }

    let ntrue = 0

    for (const [value] of Object.entries(dynamicLayerState)) {
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

  const toggleVisibility = () => {
    isLayerVisible = !isLayerVisible
    if (!$map.getLayer(layerId)) {
      $map.addLayer(definition)
    }
    $map.setLayoutProperty(layerId, 'visibility', visibility)
  }

  const removeLayer = () => {
    isLegendPanelVisible = false
    isOpacityPanelVisible = false
    isFilterPanelVisible = false
    confirmDeleteLayerDialogVisible = false

    setTimeout(() => {
      $map.removeLayer(layerId)
      $layerList = $layerList.filter((item) => item.definition.id !== layerId)
      inDynamic = false
      delete layerState[layerId]
      delete sectionState[layerId]
      delete dynamicLayerState[layerId]
    }, 200)
  }

  const hierachyDown = (layerID: string) => {
    const newIndex = mapLayerIndex - 1

    if (newIndex >= 0) {
      $map.moveLayer(layerID, mapLayers[newIndex].id)
      mapLayerIndex = newIndex
      $map.triggerRepaint()
    }
  }

  const hierachyUp = (layerID: string) => {
    const newIndex = mapLayerIndex + 1

    if (newIndex <= mapLayers.length - 1) {
      $map.moveLayer(layerID, mapLayers[newIndex].id)
      mapLayerIndex = newIndex
      $map.triggerRepaint()
    }
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

  const setScalingValueRwange = () => {
    scalingValueRange = `${scalingValueStart},${scalingValueEnd}`
  }

  $: selectedLegendType, console.log('RasterLayer:selectedLegendType', selectedLegendType)
</script>

<div class="accordion-container" style="margin-left: 15px; margin-bottom: 15px;">
  <Accordion>
    <Panel variant="raised" bind:open={panelOpen} style="padding: 15px;">
      <div class="layer-header">
        <div>
          <div class="layer-header-name">
            <div class="layer-name" title={name}>
              {name}
            </div>
            <div class="unread-count">
              <div style="float: right;">
                <Tag type="is-info" size="is-small">{mapLayerIndex} / {mapLayers.length}</Tag>
              </div>
            </div>
          </div>
          <div class="layer-header-icons">
            <div class="group">
              <div
                class={isLegendPanelVisible ? 'icon-selected' : 'icon'}
                on:click={() => {
                  isLegendPanelVisible = !isLegendPanelVisible
                  isFilterPanelVisible = false
                  isOpacityPanelVisible = false
                }}>
                <Fa icon={faPalette} size="lg" style="transform: scale(0.75);" />
              </div>

              <div
                class={isFilterPanelVisible ? 'icon-selected' : 'icon'}
                on:click={() => {
                  isFilterPanelVisible = !isFilterPanelVisible
                  isLegendPanelVisible = false
                  isOpacityPanelVisible = false
                }}>
                <Fa icon={faFilter} size="lg" style="transform: scale(0.75);" />
              </div>

              <div
                class={isOpacityPanelVisible ? 'icon-selected' : 'icon'}
                style="margin-right: 3px;"
                on:click={() => {
                  isOpacityPanelVisible = !isOpacityPanelVisible
                  isLegendPanelVisible = false
                  isFilterPanelVisible = false
                }}>
                <Fa icon={faDroplet} size="lg" style="transform: scale(0.75);" />
              </div>
            </div>

            {#if $layerList.length > 1}
              <div class="group">
                <div title="Querying info" class="icon-selected" on:click={() => (queryEnabled = !queryEnabled)}>
                  <Fa icon={queryEnabled ? faSquareCheck : faSquare} size="lg" style="transform: scale(0.75);" />
                </div>

                <Checkbox
                  bind:checked={inDynamic}
                  style="--mdc-checkbox-ripple-size: 0; top: -1.25px; left: -5px; transform: scale(0.75);" />
              </div>
            {/if}

            <div class="group" style="padding-right: 5px;">
              <div class="icon-selected" title="Move layer up (in map)" on:click={() => hierachyUp(layerId)}>
                <Fa icon={faChevronUp} size="lg" style="transform: scale(0.75);" />
              </div>

              <div class="icon-selected" title="Move layer down (in map)" on:click={() => hierachyDown(layerId)}>
                <Fa icon={faChevronDown} size="lg" style="transform: scale(0.75);" />
              </div>

              <div class="icon-selected" title="Show/hide layer" on:click={() => toggleVisibility()}>
                <Fa icon={visibility === 'none' ? faEyeSlash : faEye} size="lg" style="transform: scale(0.75);" />
              </div>
              <div
                class="icon-selected"
                style="margin-right: 0;"
                title="Delete layer"
                on:click={() => (confirmDeleteLayerDialogVisible = true)}>
                <Fa icon={faTrash} size="lg" style="transform: scale(0.75);" />
              </div>
            </div>
          </div>
        </div>

        <div class="layer-actions">
          {#if isLegendPanelVisible === true}
            <div transition:slide class="action">
              <div class="header">
                <div class="name">Legend</div>
                <div class="legend-icons-container">
                  {#each Object.entries(legendTypes) as [legendType, legendTypeIcon]}
                    <div
                      class={selectedLegendType == legendType ? 'legend-icon-selected' : 'legend-icon'}
                      on:click={() => {
                        selectedLegendType = legendType
                      }}
                      title="{legendType} legend">
                      <Fa icon={legendTypeIcon} size="lg" style="transform: scale(.75);" />
                    </div>
                  {/each}
                </div>
                <div class="close icon-selected" on:click={() => (isLegendPanelVisible = false)} title="Close">
                  <Fa icon={faXmark} size="lg" />
                </div>
              </div>

              {#if selectedLegendType == 'continuous'}
                <Legend bind:activeColorMapName {layerConfig} />
              {:else if selectedLegendType == 'unique'}
                <UniqueValuesLegend bind:activeColorMapName {layerConfig} />
              {:else}
                <IntervalsLegend bind:activeColorMapName {layerConfig} />
              {/if}
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

<Dialog bind:open={confirmDeleteLayerDialogVisible}>
  <Title>Delete Layer</Title>
  <ContentDialog>
    Are you sure you want to delete this layer?<br /><br />
    {name}
  </ContentDialog>
  <ActionsDialog>
    <Button>
      <LabelButton>No</LabelButton>
    </Button>
    <Button on:click={() => removeLayer()}>
      <LabelButton>Yes</LabelButton>
    </Button>
  </ActionsDialog>
</Dialog>

<style lang="scss">
  .layer-header {
    .layer-header-name {
      display: flex;
      justify-content: left;
      align-items: center;
      font-family: ProximaNova, sans-serif;
      height: 20px;

      .layer-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
        font-size: 14px;
      }

      .unread-count {
        padding-left: 7.5px;
      }
    }

    .legend-icons-container {
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
      border: 0px solid;
      padding-right: 50%;
      width: 50%;
    }

    .legend-icon {
      opacity: 0.5;
      display: inline;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
    }

    .legend-icon-selected {
      opacity: 1;
      display: inline;
      cursor: pointer;
    }

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
