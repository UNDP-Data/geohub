<script lang="ts" context="module">
  const layerState = {}
  const sectionState = {}
  const dynamicLayerState = {}
</script>

<script lang="ts">
  import 'bulma/css/bulma.css'
  import IconButton from '@smui/icon-button'
  import Accordion, { Panel } from '@smui-extra/accordion'
  import Slider from '@smui/slider'
  import Checkbox from '@smui/checkbox'
  import { slide } from 'svelte/transition'
  import Tag from 'svelma/src/components/Tag/Tag.svelte'

  import Colormaps from './Colormaps.svelte'
  import Legend from './Legend.svelte'

  import { layerList, dynamicLayers, map, removedLayerFromLayersTab } from '../stores'
  import type { Layer, LayerDefinition } from '../lib/types'
  import { LayerInitialValues } from '../lib/constants'

  export let layerConfig: Layer = LayerInitialValues

  let name: string, definition: LayerDefinition
  ;({ name, definition } = layerConfig)
  const layerId = definition.id

  export let activeSection: string = sectionState[layerId] || ''
  export let panelOpen: boolean = layerState[layerId] || false
  export let inDynamic: boolean = dynamicLayerState[layerId] || false
  export let disabled = true

  const iconButtonStyle = 'font-size: 18px; width: 24px; height: 24px;'

  let mapLayers = $map.getStyle().layers
  let layer = mapLayers.filter((item: LayerDefinition) => item.id == layerId).pop()
  let colorMapName = 'viridis'
  let mapLayerIndex = mapLayers.indexOf(layer)
  let l = $layerList.filter((item) => item.definition.id === layerId).pop()
  let lMax = parseFloat(l.info['band_metadata'][0][1]['STATISTICS_MAXIMUM']).toFixed(2)
  let lMin = parseFloat(l.info['band_metadata'][0][1]['STATISTICS_MINIMUM']).toFixed(2)
  let layerOpacity = 1
  let mapLayerCount = mapLayers.length
  let queryEnabled = true
  let reverseColorMap = false
  let scalingValueRange = ''
  let visSelected = false

  $: activeSection = sectionState[layerId] || ''
  $: activeSection, setSectionState()
  $: colorMapName, selectColorMap()
  $: colorMapName, selectColorMap()
  $: inDynamic = dynamicLayerState[layerId] || false
  $: inDynamic, setDynamicLayerState()
  $: layerOpacity, setLayerOpacity()
  $: panelOpen = layerState[layerId] || false
  $: panelOpen, setLayerState()
  $: reverseColorMap, selectColorMap()
  $: scalingValueRange, selectScaling()
  $: visibility = visSelected ? 'visible' : 'none'

  const setSectionState = () => {
    sectionState[layerId] = activeSection
  }

  const setDynamicLayerState = () => {
    dynamicLayerState[layerId] = inDynamic

    if (inDynamic == true) {
      if (!$dynamicLayers.includes(layerId)) {
        dynamicLayers.set([...$dynamicLayers, layerId])
      }
    } else {
      $dynamicLayers = $dynamicLayers.filter((item) => item !== layerId)
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

  const selectColorMap = () => {
    if (!colorMapName) return
    let name = colorMapName
    if (reverseColorMap) {
      name = `${name}_r`
    }
    updateParamsInURL({ colormap_name: name })
  }

  const selectScaling = () => {
    if (!scalingValueRange) return
    updateParamsInURL({ rescale: scalingValueRange })
  }

  const setLayerOpacity = () => {
    $map.setPaintProperty(layerId, 'raster-opacity', layerOpacity)
  }

  const toggleVisibility = () => {
    visSelected = !visSelected
    if (!$map.getLayer(layerId)) {
      $map.addLayer(definition)
    }
    $map.setLayoutProperty(layerId, 'visibility', visibility)
  }

  const removeLayer = () => {
    $removedLayerFromLayersTab = true
    $map.removeLayer(layerId)
    $layerList = $layerList.filter((item) => item.definition.id !== layerId)
    inDynamic = false
    delete layerState[layerId]
    delete sectionState[layerId]
    delete dynamicLayerState[layerId]
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
  }
</script>

<div class="accordion-container" style="margin-left: 15px; margin-bottom: 15px;">
  <Accordion>
    <Panel variant="raised" bind:open={panelOpen} style="padding: 15px;">
      <div class="layer-header">
        <div>
          <div class="layer-header-name">
            <div class="layer-name">
              {name}
            </div>
            <div class="unread-count">
              <div style="float: right;">
                <Tag type="is-info" size="is-small">{mapLayerIndex} / {mapLayerCount}</Tag>
              </div>
            </div>
          </div>
          <div class="layer-header-icons">
            <div class="group">
              <IconButton
                title="Color palette"
                class="material-icons"
                style={iconButtonStyle}
                on:click={() => (activeSection = 'color')}>
                palette
              </IconButton>
              <IconButton
                title="Define/filter"
                class="material-icons"
                style={iconButtonStyle}
                on:click={() => (activeSection = 'band')}>
                legend_toggle
              </IconButton>
              <IconButton
                title="Set transparency / opacity"
                class="material-icons"
                style={iconButtonStyle}
                on:click={() => (activeSection = 'opacity')}>
                opacity
              </IconButton>
            </div>

            <div class="group">
              {#if queryEnabled === false}
                <IconButton
                  title="Show querying info"
                  class="material-icons"
                  style={iconButtonStyle}
                  on:click={() => (queryEnabled = true)}>
                  check_box_outline_blank
                </IconButton>
              {:else}
                <IconButton
                  title="Hide querying info"
                  class="material-icons"
                  style={iconButtonStyle}
                  on:click={() => (queryEnabled = false)}>check_box</IconButton>
              {/if}

              <IconButton
                title="Move layer up (in map)"
                class="material-icons"
                style={iconButtonStyle}
                on:click={() => hierachyUp(layerId)}>
                keyboard_double_arrow_up
              </IconButton>

              <IconButton
                title="Move layer down (in map)"
                class="material-icons"
                style={iconButtonStyle}
                on:click={() => hierachyDown(layerId)}
                >keyboard_double_arrow_down
              </IconButton>

              {#if visibility === 'none'}
                <IconButton
                  title="Hide layer"
                  class="material-icons"
                  style={iconButtonStyle}
                  on:click={() => toggleVisibility()}>visibility_off</IconButton>
              {:else}
                <IconButton
                  title="Show layer"
                  class="material-icons"
                  style={iconButtonStyle}
                  on:click={() => toggleVisibility()}>visibility</IconButton>
              {/if}

              {#if $layerList.length > 1}
                <Checkbox
                  bind:checked={inDynamic}
                  style="--mdc-checkbox-ripple-size: 0; top: -2.5px; left: 1.5px; transform: scale(0.75);" />
              {/if}

              <IconButton
                title="Remove layer"
                class="material-icons"
                style={iconButtonStyle}
                on:click={() => removeLayer()}>delete</IconButton>
            </div>
          </div>
        </div>

        <div class="layer-actions">
          {#if activeSection === 'color'}
            <div transition:slide>
              <div class="header">
                <div class="name">Rescale</div>
                <div class="close">
                  <IconButton
                    title="Close"
                    class="material-icons"
                    style={iconButtonStyle}
                    on:click={() => (activeSection = '')}>
                    close
                  </IconButton>
                </div>
              </div>
              <Colormaps bind:colorMapName bind:layerConfig bind:scalingValueRange bind:reverseColorMap />
            </div>
          {:else if activeSection === 'band'}
            <div transition:slide>
              <div class="header">
                <div class="name">Legend</div>
                <div class="close">
                  <IconButton
                    title="Close"
                    class="material-icons"
                    style={iconButtonStyle}
                    on:click={() => (activeSection = '')}>
                    close
                  </IconButton>
                </div>
              </div>
              <Legend {colorMapName} {lMax} {lMin} />
            </div>
          {:else if activeSection === 'opacity'}
            <div transition:slide>
              <div class="header">
                <div class="name">Opacity</div>
                <div class="close">
                  <IconButton
                    title="Close"
                    class="material-icons"
                    style={iconButtonStyle}
                    on:click={() => (activeSection = '')}>
                    close
                  </IconButton>
                </div>
              </div>
              <Slider bind:value={layerOpacity} min={0} max={1} step={0.01} input$aria-label="Layer opacity" />
            </div>
          {/if}
        </div>
      </div></Panel>
  </Accordion>
</div>

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
        border-radius: 12.5px;
        padding: 2px;
        padding-bottom: 4px;
      }
    }

    .layer-actions {
      margin-top: 10px;
      border-top: 1px solid rgba(204, 204, 204, 0.5);

      .header {
        display: flex;
        justify-content: left;
        align-items: center;
        margin-top: 15px;

        .name {
          width: 100%;
        }
      }
    }
  }
</style>
