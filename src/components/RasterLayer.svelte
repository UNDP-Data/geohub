<script lang="ts" context="module">
  const _layerState = {}
  const _sectionState = {}
  const _dynamicLayerState = {}
</script>

<script lang="ts">
  import { map } from '../stores/mapstore'
  import { layerList, dynamicLayers } from '../stores/stores'
  import IconButton, { Icon } from '@smui/icon-button'
  import Accordion, { Panel, Header, Content } from '@smui-extra/accordion'
  import Badge from '@smui-extra/badge'
  import Slider from '@smui/slider'
  import Checkbox from '@smui/checkbox'
  import Colormaps from './Colormaps.svelte'

  export let layerCfg: any

  let lName: string, lDef: any
  ;({ lName, lDef } = layerCfg)
  const layerId = lDef.id

  export let activeSection: string = _sectionState[layerId] || ''
  export let panelOpen: boolean = _layerState[layerId] || false
  export let inDynamic: boolean = _dynamicLayerState[layerId] || false
  export let disabled = false

  let allLayers = $map.getStyle().layers
  let colorMapName = ''
  let layer = allLayers.filter((item: any) => item.id == layerId).pop()
  let len = allLayers.length
  let index = allLayers.indexOf(layer)
  let layerOpacity = 1
  let queryEnabled = true
  let visSelected = false

  $: activeSection, setSectionState()
  $: activeSection = _sectionState[layerId] || ''
  $: colorMapName, selectColorMap()
  $: inDynamic = _dynamicLayerState[layerId] || false
  $: inDynamic, setDynamicLayerState()
  $: layerOpacity, setLayerOpacity()
  $: panelOpen, setLayerState()
  $: panelOpen = _layerState[layerId] || false
  $: visibility = visSelected ? 'visible' : 'none'

  const toggleVisibility = () => {
    if (!$map.getLayer(layerId)) {
      $map.addLayer(lDef)
    }
    $map.setLayoutProperty(layerId, 'visibility', visibility)
  }

  const removeLayer = () => {
    $map.removeLayer(layerId)
    //TODO remove the layer source as well if none of the layers reference it
    $layerList = $layerList.filter((item) => item.lDef.id !== layerId)
    //$dynamicLayers  = $dynamicLayers.filter((item) => item !== layerId );

    //update dynamic
    inDynamic = false
    setDynamicLayerState()

    //update state vars

    delete _layerState[layerId]
    delete _sectionState[layerId]
    delete _dynamicLayerState[layerId]
  }

  const setLayerOpacity = () => {
    $map.setPaintProperty(layerId, 'raster-opacity', layerOpacity)
  }

  const setLayerState = () => {
    _layerState[layerId] = panelOpen
  }

  const setSectionState = () => {
    _sectionState[layerId] = activeSection
  }

  const setDynamicLayerState = () => {
    console.log('DLL before', JSON.stringify($dynamicLayers))
    _dynamicLayerState[layerId] = inDynamic
    if (inDynamic == true) {
      if (!$dynamicLayers.includes(layerId)) {
        dynamicLayers.set([...$dynamicLayers, layerId])
      }
    } else {
      $dynamicLayers = $dynamicLayers.filter((item) => item !== layerId)
    }

    let ntrue = 0
    for (const [value] of Object.entries(_dynamicLayerState)) {
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

  const hierachyDown = (layerID: string) => {
    const newIndex = index - 1

    if (newIndex >= 0) {
      $map.moveLayer(layerID, allLayers[newIndex].id)
      index = newIndex
      $map.triggerRepaint()
    }
  }

  const hierachyUp = (layerID: string) => {
    const newIndex = index + 1

    if (newIndex <= allLayers.length - 1) {
      $map.moveLayer(layerID, allLayers[newIndex].id)
      index = newIndex
      $map.triggerRepaint()
    }
  }

  const selectColorMap = () => {
    if (colorMapName) {
      let layerS = allLayers.filter((item: any) => item.id === layerId).pop()['source']
      const layerSource = $map.getSource(layerS)
      let old_url = layerSource.tiles[0]

      // console.log(old_url)
      let oldUrl = new URL(old_url)
      oldUrl.searchParams.set('colormap_name', colorMapName)
      let newUrl = oldUrl.toString()

      // console.log(newUrl);
      $map.getSource(layerS).tiles = [decodeURI(newUrl)]
      $map.style.sourceCaches[layerS].clearTiles()
      $map.style.sourceCaches[layerS].update($map.transform)
      $map.triggerRepaint()
    }
  }
</script>

<Accordion>
  <Panel variant="unelevated" color="white" bind:open={panelOpen}>
    <div class="layer-header">
      <div class="layer-header-name">
        <Header>
          <span class="layer-name"
            >{lName}<Badge position="inset" align="bottom-end" aria-label="unread count">{index}/{len}</Badge></span
          >
        </Header>
      </div>
      <div class="layer-header-icons">
        <IconButton
          title="Toggle visibility"
          size="mini"
          on:click={() => toggleVisibility()}
          toggle
          bind:pressed={visSelected}
        >
          <Icon class="material-icons">visibility_off</Icon>
          <Icon color="primary" class="material-icons" on>visibility</Icon>
        </IconButton>

        <IconButton title="Remove layer" size="mini" class="material-icons" on:click={() => removeLayer()}
          >delete</IconButton
        >

        <Checkbox bind:checked={inDynamic} />
      </div>
    </div>
    <Content>
      <div style="display:flex; justify-content: center;">
        <IconButton
          title="Color palette"
          size="mini"
          class="material-icons"
          on:click={() => {
            activeSection = 'color'
          }}>palette</IconButton
        >

        <IconButton
          title="Define/filter"
          size="mini"
          class="material-icons"
          on:click={() => {
            activeSection = 'band'
          }}>legend_toggle</IconButton
        >

        <IconButton
          title="Set transparency/opacity"
          size="mini"
          class="material-icons"
          on:click={() => {
            activeSection = 'opacity'
          }}>opacity</IconButton
        >

        <IconButton title="Toggle querying/info" size="mini" toggle bind:pressed={queryEnabled}>
          <Icon class="material-icons">indeterminate_check_box</Icon>
          <Icon color="primary" class="material-icons" on>check_box</Icon>
        </IconButton>

        <IconButton
          title="Move layer up (in map)"
          size="mini"
          class="material-icons"
          on:click={() => {
            hierachyUp(layerId)
          }}
          >keyboard_double_arrow_up
        </IconButton>

        <IconButton
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
        <Colormaps bind:colorMapName />
      {:else if activeSection === 'band'}
        <p>B</p>
      {:else if activeSection === 'opacity'}
        <div class="layer-header">
          <div>Opacity:</div>
          <div class="layer-header-name">
            <Slider bind:value={layerOpacity} min={0} max={1} step={0.01} input$aria-label="Layer opacity" />
          </div>
          <!-- <div>{layerOpacity}</div> -->
          <!-- <Slider on:SMUISlider:change={setLayerOpacity}  bind:value={layerOpacity} min={0} max={1} step={0.01} input$aria-label="Layer opacity"/> -->
        </div>
      {/if}
    </Content>
  </Panel>
</Accordion>

<style>
  .layer-header {
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin: auto;
  }
  .layer-header-name {
    align-self: center;
    flex: 0 0 160px;
    max-width: 80%;
    flex-wrap: nowrap;
    overflow-wrap: anywhere;
  }
  .layer-header-icons {
    display: flex;
    flex-direction: row;
    align-self: flex-start;
  }
  .layer-name {
    display: flex;
    cursor: pointer;
    font-family: Roboto, serif;
    width: 100%;
    min-height: 2.5rem;
    height: auto;
    font-size: 12pt;
    justify-content: center;
    align-items: center;
    width: fit-content;
  }

  :global(.smui-accordion) {
    z-index: 0;
  }

  :global(.mdc-deprecated-list) {
    z-index: 1;
  }

  :global(.mdc-deprecated-list-item) {
    height: auto !important;
    width: auto;
    /* color: mintcream!important; */
  }
</style>
