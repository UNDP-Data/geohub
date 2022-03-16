<script lang="ts" context="module">
  const layerState = {}
  const sectionState = {}
  const dynamicLayerState = {}
</script>

<script lang="ts">
  import 'bulma/css/bulma.css'
  import IconButton, { Icon } from '@smui/icon-button'
  import Accordion, { Panel, Header, Content } from '@smui-extra/accordion'
  import Slider from '@smui/slider'
  import Checkbox from '@smui/checkbox'
  import { slide } from 'svelte/transition'
  import Tag from 'svelma/src/components/Tag/Tag.svelte'

  import Colormaps from './Colormaps.svelte'
  import Legend from './Legend.svelte'

  import { map } from '../stores/mapstore'
  import { layerList, dynamicLayers } from '../stores/stores'
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

  let mapLayers = $map.getStyle().layers
  let colorMapName = 'viridis'
  let layer = mapLayers.filter((item: LayerDefinition) => item.id == layerId).pop()
  let len = mapLayers.length
  let index = mapLayers.indexOf(layer)
  let layerOpacity = 1
  let queryEnabled = true
  let visSelected = false
  let reverseColorMap = false
  let scalingValueRange = ''
  let l = $layerList.filter((item) => item.definition.id === layerId).pop()
  let lMin = parseFloat(l.info['band_metadata'][0][1]['STATISTICS_MINIMUM']).toFixed(2)
  let lMax = parseFloat(l.info['band_metadata'][0][1]['STATISTICS_MAXIMUM']).toFixed(2)

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

    for (const [key, value] of Object.entries(dynamicLayerState)) {
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

  $: activeSection, setSectionState()

  $: activeSection = sectionState[layerId] || ''
  $: colorMapName, selectColorMap()
  $: inDynamic = dynamicLayerState[layerId] || false
  $: inDynamic, setDynamicLayerState()
  $: layerOpacity, setLayerOpacity()
  $: panelOpen, setLayerState()
  $: panelOpen = layerState[layerId] || false

  $: visibility = visSelected ? 'visible' : 'none'
  $: colorMapName, selectColorMap()
  $: reverseColorMap, selectColorMap()
  $: scalingValueRange, selectScaling()

  const toggleVisibility = () => {
    if (!$map.getLayer(layerId)) {
      $map.addLayer(definition)
    }
    $map.setLayoutProperty(layerId, 'visibility', visibility)
  }

  const removeLayer = () => {
    $map.removeLayer(layerId)
    //TODO remove the layer source as well if none of the layers reference it
    $layerList = $layerList.filter((item) => item.definition.id !== layerId)
    //$dynamicLayers  = $dynamicLayers.filter((item) => item !== layerId );

    //update dynamic
    inDynamic = false
    //setDynamicLayerState()

    //update state vars

    delete layerState[layerId]
    delete sectionState[layerId]
    delete dynamicLayerState[layerId]
  }

  const hierachyDown = (layerID: string) => {
    const newIndex = index - 1

    if (newIndex >= 0) {
      $map.moveLayer(layerID, mapLayers[newIndex].id)
      index = newIndex
      $map.triggerRepaint()
    }
  }

  const hierachyUp = (layerID: string) => {
    const newIndex = index + 1

    if (newIndex <= mapLayers.length - 1) {
      $map.moveLayer(layerID, mapLayers[newIndex].id)
      index = newIndex
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

<Accordion style="padding-left: 10px; padding-right: -5px;">
  <Panel
    variant="unelevated"
    color="white"
    bind:open={panelOpen}
    style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc; margin-bottom: 15px; padding: 5px;">
    <div class="layer-header">
      <Header style="background-color: transparent; --mdc-ripple-fg-size:0;">
        <div class="layer-header-name">
          <div class="layer-name">
            {name}
          </div>
          <div class="unread-count">
            <div style="float: right;">
              <Tag type="is-info" size="is-small">{index} / {len}</Tag>
            </div>
          </div>
        </div>
      </Header>
      <div class="layer-header-icons">
        <IconButton
          title="Toggle visibility"
          size="mini"
          on:click={() => toggleVisibility()}
          toggle
          bind:pressed={visSelected}
          style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;">
          <Icon class="material-icons">visibility_off</Icon>
          <Icon color="primary" class="material-icons" on>visibility</Icon>
        </IconButton>

        <IconButton
          title="Remove layer"
          size="mini"
          class="material-icons"
          on:click={() => removeLayer()}
          style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;">
          delete
        </IconButton>

        <Checkbox
          bind:checked={inDynamic}
          style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;" />
      </div>
    </div>
    <Content>
      <div style="display:flex; justify-content: left;">
        <IconButton
          style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;"
          title="Color palette"
          size="mini"
          class="material-icons"
          on:click={() => {
            activeSection = 'color'
          }}>palette</IconButton>

        <IconButton
          style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;"
          title="Define/filter"
          size="mini"
          class="material-icons"
          on:click={() => {
            activeSection = 'band'
          }}>legend_toggle</IconButton>

        <IconButton
          style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;"
          title="Set transparency/opacity"
          size="mini"
          class="material-icons"
          on:click={() => {
            activeSection = 'opacity'
          }}>opacity</IconButton>

        <IconButton
          style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;"
          title="Toggle querying/info"
          size="mini"
          toggle
          bind:pressed={queryEnabled}>
          <Icon class="material-icons">indeterminate_check_box</Icon>
          <Icon color="primary" class="material-icons" on>check_box</Icon>
        </IconButton>

        <IconButton
          style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;"
          title="Move layer up (in map)"
          size="mini"
          class="material-icons"
          on:click={() => {
            hierachyUp(layerId)
          }}
          >keyboard_double_arrow_up
        </IconButton>

        <IconButton
          style="transform: scale(0.75); background-color: transparent; --mdc-ripple-fg-size:0;"
          title="Move layer down (in map)"
          size="mini"
          class="material-icons"
          on:click={() => {
            hierachyDown(layerId)
          }}
          >keyboard_double_arrow_down
        </IconButton>
      </div>

      {#if activeSection === 'color'}
        <div transition:slide>
          <Colormaps bind:colorMapName bind:layerConfig bind:scalingValueRange bind:reverseColorMap />
        </div>
      {:else if activeSection === 'band'}
        <Legend {colorMapName} {lMax} {lMin} />
      {:else if activeSection === 'opacity'}
        <div class="layer-header" transition:slide>
          <div>Opacity:</div>
          <div class="">
            <Slider bind:value={layerOpacity} min={0} max={1} step={0.01} input$aria-label="Layer opacity" />
          </div>
        </div>
      {/if}
    </Content>
  </Panel>
</Accordion>

<style lang="scss">
  .layer-header {
    .layer-header-name {
      display: flex;
      justify-content: left;
      align-items: center;
      cursor: pointer;
      font-family: ProximaNova, sans-serif;
      font-size: 13px;
      height: 20px;

      .layer-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 100%;
      }

      .unread-count {
        padding-left: 7.5px;
      }

      .layer-header-icons {
        display: flex;
        flex-direction: row;
        align-self: flex-start;
      }
    }
  }
</style>
