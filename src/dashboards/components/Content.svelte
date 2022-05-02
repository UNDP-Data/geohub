<script lang="ts">
  import { LayerTypes } from '$lib/constants'
  import { onMount } from 'svelte'
  import Drawer, { AppContent, Content } from '@smui/drawer'
  import { map } from '../stores'
  import SegmentedButton, { Segment } from '@smui/segmented-button'
  import Button from '@smui/button'
  import { Label } from '@smui/common'
  import Paper from '@smui/paper'
  import FormField from '@smui/form-field'
  import Checkbox from '@smui/checkbox'
  import { fetchUrl } from '$lib/helper'
  import type { RasterLayerSpecification, HeatmapLayerSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import RangeSlider from 'svelte-range-slider-pips'

  const AZURE_URL = 'https://undpngddlsgeohubdev01.blob.core.windows.net'
  const HREA_TOKEN =
    '?c3Y9MjAyMS0wNC0xMCZzZT0yMDIyLTA1LTAzVDE0JTNBMjElM0E0OVomc3I9YiZzcD1yJnNpZz1TdEJmZ1lISmgxd2xnb1VrMFJteDlNRWxmSXFvQk1jYiUyQnV0Qk9KRWtQUm8lM0Q='
  const ML_TOKEN =
    '?c3Y9MjAyMS0wNC0xMCZzZT0yMDIyLTA1LTAzVDE0JTNBMjIlM0EzM1omc3I9YiZzcD1yJnNpZz1XQUFiM2o4QjZSN2dFUlYlMkJhWUlkdnRsWUR5SGc0cG5TJTJGU0p2S2NKSDllZyUzRA=='
  const RWI_TOKEN =
    '?sv=2020-10-02&st=2022-04-27T04%3A00%3A00Z&se=2025-01-01T05%3A00%3A00Z&sr=b&sp=r&sig=FxQpof0Mhp9hU0DqfitRm6J1JkPdw0K8eGuou1Y2vRI%3D'
  const HREA_ID = 'hrea'
  const ML_ID = 'ml'
  const RWI_ID = 'rwi'
  const ADM_ID = 'admin'
  const ADM_LAYER = 'adm1_polygons'
  const HREA_URL = `${AZURE_URL}/electricity/High_Resolution_Electricity_Access/HREA_electricity_access_2020.tif${HREA_TOKEN}`
  const ML_URL = `${AZURE_URL}/electricity/Machine_Learning_Electricity_Estimate/MLEE_2019_Result.tif${ML_TOKEN}`
  const RWI_URL = `${AZURE_URL}/test/rwi/rwi_adm1.geojson${RWI_TOKEN}`

  const BingMapsKey = import.meta.env.VITE_BINGMAP_KEY
  const aerialBingUrl = 'http://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1'
  const apiUrl = import.meta.env.VITE_TITILER_ENDPOINT

  export let drawerOpen = false
  let hoveredStateId = null

  let showIntro = true
  let checked = false
  let electricityChoices = ['HREA', 'ML']
  let electricitySelected = 'HREA'
  let interactChoices = ['Hover', 'Click']
  let interactSelected = 'Hover'
  let drawerWidth = 355
  let isResizingDrawer = false
  let bingAerialLayerMeta = undefined
  let aerialBingTiles = []

  let layerOpacity = 1
  let rangeSliderValues = [layerOpacity * 100]
  $: layerOpacity = rangeSliderValues[0] / 100
  $: layerOpacity, setLayerOpacity()

  const setLayerOpacity = () => {
    if ($map && $map.getLayer(RWI_ID)) {
      $map.setPaintProperty(RWI_ID, 'heatmap-opacity', layerOpacity)
    }
  }

  function hideIntro() {
    showIntro = false
  }

  $: {
    if (drawerOpen) {
      try {
        setContentContainerMargin(drawerWidth)
      } catch (e) {} // eslint-disable-line
    } else {
      setContentContainerMargin(0)
    }
  }

  onMount(() => {
    document.addEventListener('mousemove', (e) => handleMousemove(e))
    document.addEventListener('mouseup', handleMouseup)
    map.subscribe(() => {
      if ($map) {
        $map.on('load', () => {
          loadRasterLayer(HREA_ID, HREA_URL, ML_ID)
          loadAdminLayer()
        })
      }
    })
  })

  const setContentContainerMargin = (margin: number) => {
    document.querySelector<HTMLElement>('body > div > div.content-container > div').style.marginLeft = `${margin}px`
    $map.triggerRepaint()
    $map.resize()
  }

  const handleMousemove = (e: MouseEvent | TouchEvent) => {
    if (!isResizingDrawer) return

    if (e instanceof MouseEvent) drawerWidth = e.clientX
    if (e instanceof TouchEvent) drawerWidth = e.touches?.[0].pageX

    setContentContainerMargin(drawerWidth)
  }

  const handleMousedown = () => (isResizingDrawer = true)
  const handleMouseup = () => (isResizingDrawer = false)

  const loadAdminLayer = () => {
    const layerSource = {
      type: LayerTypes.VECTOR,
      maxzoom: 10,
      promoteId: 'adm1_id',
      tiles: [`${AZURE_URL}/admin/${ADM_LAYER}/{z}/{x}/{y}.pbf`],
    }
    const layerFill = {
      id: ADM_ID,
      type: LayerTypes.FILL,
      source: ADM_ID,
      'source-layer': ADM_LAYER,
      paint: {
        'fill-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          'hsla(0, 0%, 0%, 0.05)',
          'hsla(0, 0%, 0%, 0)',
        ],
        'fill-outline-color': [
          'case',
          ['boolean', ['feature-state', 'hover'], false],
          'hsla(0, 0%, 0%, 1)',
          'hsla(0, 0%, 0%, 0)',
        ],
      },
    }
    !$map.getSource(ADM_ID) && $map.addSource(ADM_ID, layerSource)
    !$map.getLayer(ADM_ID) && $map.addLayer(layerFill)
  }

  const loadRasterLayer = async (id: string, url: string, oldId: string) => {
    const layerInfo = await fetchUrl(`${apiUrl}/info?url=${url}`)
    const layerBandMetadataMin = layerInfo['band_metadata'][0][1]['STATISTICS_MINIMUM']
    const layerBandMetadataMax = layerInfo['band_metadata'][0][1]['STATISTICS_MAXIMUM']
    const apiUrlParams = {
      scale: 1,
      TileMatrixSetId: 'WebMercatorQuad',
      url,
      bidx: 1,
      unscale: false,
      resampling: 'nearest',
      rescale: `${layerBandMetadataMin},${layerBandMetadataMax}`,
      return_mask: true,
      colormap_name: 'bugn',
    }

    const layerSource = {
      type: LayerTypes.RASTER,
      tiles: [`${apiUrl}/tiles/{z}/{x}/{y}.png?${new URLSearchParams(apiUrlParams).toString()}`],
      tileSize: 256,
      bounds: layerInfo['bounds'],
      attribution:
        'Map tiles by <a target="_top" rel="noopener" href="http://undp.org">UNDP</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>.\
            Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>, under <a target="_top" rel="noopener" href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>',
    }
    const layerDefinition: RasterLayerSpecification = {
      id: id,
      type: LayerTypes.RASTER,
      source: id,
      minzoom: 0,
      maxzoom: 22,
      layout: { visibility: 'visible' },
    }
    let firstSymbolId = undefined
    for (const layer of $map.getStyle().layers) {
      if (layer.type === 'symbol' || layer.id === RWI_ID) {
        firstSymbolId = layer.id
        break
      }
    }

    $map.getLayer(oldId) && $map.removeLayer(oldId)
    $map.getSource(oldId) && $map.removeSource(oldId)
    !$map.getSource(id) && $map.addSource(id, layerSource)
    !$map.getLayer(id) && $map.addLayer(layerDefinition, firstSymbolId)
  }

  const onMouseMove = (e) => {
    if (e.features.length > 0) {
      if (hoveredStateId) {
        $map.setFeatureState(
          {
            source: ADM_ID,
            sourceLayer: ADM_LAYER,
            id: hoveredStateId,
          },
          { hover: false },
        )
      }
      hoveredStateId = e.features[0].id
      $map.setFeatureState(
        {
          source: ADM_ID,
          sourceLayer: ADM_LAYER,
          id: hoveredStateId,
        },
        { hover: true },
      )
    }
  }

  const onMouseLeave = () => {
    if (hoveredStateId) {
      $map.setFeatureState(
        {
          source: ADM_ID,
          sourceLayer: ADM_LAYER,
          id: hoveredStateId,
        },
        { hover: false },
      )
    }
    hoveredStateId = null
  }

  const loadInteraction = ({ target: { textContent } }) => {
    if (textContent === 'Click') {
      $map.on('mousemove', ADM_ID, onMouseMove)
      $map.on('mouseleave', ADM_ID, onMouseLeave)
    } else {
      $map.off('mousemove', ADM_ID, onMouseMove)
      $map.off('mouseleave', ADM_ID, onMouseLeave)
    }
  }

  const loadLayer = ({ target: { textContent } }) => {
    if (textContent === 'HREA') loadRasterLayer(HREA_ID, HREA_URL, ML_ID)
    else if (textContent === 'ML') loadRasterLayer(ML_ID, ML_URL, HREA_ID)
  }

  const loadHeatmap = ({ target: { checked } }) => {
    const layerSource = {
      type: 'geojson',
      data: RWI_URL,
    }
    const layerDefinition: HeatmapLayerSpecification = {
      id: RWI_ID,
      type: LayerTypes.HEATMAP,
      source: RWI_ID,
      minzoom: 0,
      maxzoom: 22,
      layout: { visibility: 'visible' },
      paint: {
        'heatmap-weight': {
          property: RWI_ID,
          type: 'exponential',
          stops: [
            [-0.855, 0],
            [1.06009, 1],
          ],
        },
      },
    }
    let firstSymbolId = undefined
    for (const layer of $map.getStyle().layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id
        break
      }
    }

    if (checked) {
      !$map.getSource(RWI_ID) && $map.addSource(RWI_ID, layerSource)
      !$map.getLayer(RWI_ID) && $map.addLayer(layerDefinition, firstSymbolId)
      $map.setPaintProperty(RWI_ID, 'heatmap-opacity', layerOpacity)
    } else {
      $map.getLayer(RWI_ID) && $map.removeLayer(RWI_ID)
      $map.getSource(RWI_ID) && $map.removeSource(RWI_ID)
    }
  }

  const addBingAerialLayer = async () => {
    if (aerialBingTiles.length == 0) {
      bingAerialLayerMeta = await fetchUrl(
        `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=${BingMapsKey}`,
      )
      const { resources } = bingAerialLayerMeta.resourceSets[0]
      const imageUrlSubdomains = resources[0].imageUrlSubdomains
      aerialBingTiles = imageUrlSubdomains.map((el) => {
        return aerialBingUrl.replace('{subdomain}', el)
      })
    }
    const layerSource = {
      type: 'raster',
      tiles: aerialBingTiles,
      tileSize: 256,
      attribution: 'Layer powered by Microsoft',
    }
    if (!('BING' in $map.getStyle().sources)) {
      console.log('adding Bing aerial')
      $map.addSource('BING', layerSource)

      const layerDefinition: RasterLayerSpecification = {
        id: 'bing',
        type: 'raster',
        source: 'BING',
        minzoom: 0,
        maxzoom: 22,
        layout: {
          visibility: 'visible',
        },
      }
      $map.addLayer(layerDefinition)
    } else {
      const vis = $map.getLayoutProperty('bing', 'visibility')
      const visibility = vis === 'visible' ? 'none' : 'visible'
      console.log(vis, visibility)
      $map.setLayoutProperty('bing', 'visibility', visibility)
    }
  }
</script>

<div class="content-container">
  <Drawer
    variant="dismissible"
    bind:open={drawerOpen}
    style="width: {drawerWidth}px; max-width: {drawerWidth}px; overflow:visible;">
    <div class="drawer-container">
      <div class="drawer-content" style="width: {drawerWidth - 10}px; max-width: {drawerWidth - 10}px;">
        <Content style="padding: 15px; overflow: visible;">
          {#if showIntro}
            <Paper>
              <p>
                Welcome to the UNDP GeoHub dashboard. This site serves as a simplified preview to familiarize users with
                data being prepared for the full-fledged GeoHub web app launching soon. Presented here is a High
                Resolution Electricity Access (HREA) created by the University of Michigan, used to support the 2030
                Social Development Goal (SDG) number 7: ensuring access to affordable, reliable, sustainable and modern
                energy for all.
              </p>
              <p>
                This map displays two types of electricity access layers, with an optional poverty heatmap which can be
                overlaid. Layer statistics can be explored by either hovering over the map, showing values for the
                layers underneath the mouse, or by drawing a circle, providing summaries of the values contained within.
              </p>
              <br />
              <Button on:click={hideIntro}>Explore Data</Button>
            </Paper>
          {/if}

          {#if !showIntro}
            <Paper>
              Layers
              <br /><br />
              Electricity Access
              <br />
              <SegmentedButton segments={electricityChoices} let:segment singleSelect bind:electricitySelected>
                <Segment {segment} on:click={loadLayer}>
                  <Label>{segment}</Label>
                </Segment>
              </SegmentedButton>
              <br /><br />
              Poverty
              <br />
              <FormField>
                <Checkbox bind:checked on:change={loadHeatmap} />
                <span slot="label">Show Heatmap</span>
              </FormField>
              <div class="action">
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
            </Paper>
            <br />
            <Paper>
              Statistics
              <br />
              <SegmentedButton segments={interactChoices} let:segment singleSelect bind:interactSelected>
                <Segment {segment} on:click={loadInteraction}>
                  <Label>{segment}</Label>
                </Segment>
              </SegmentedButton>
              <br />
            </Paper>
          {/if}
          <div />
        </Content>
      </div>
      <div
        class="drawer-divider"
        on:mousedown={handleMousedown}
        on:touchstart={handleMousedown}
        on:mousemove={handleMousemove}
        on:touchmove={handleMousemove}
        on:mouseup={handleMouseup}
        on:touchend={handleMouseup}>
        <div class="custom-handle">||</div>
      </div>
    </div>
  </Drawer>

  <AppContent class="app-content">
    <main class="main-content">
      <slot />
    </main>
  </AppContent>
</div>

<style lang="scss">
  @import '../../styles/bulma.css';
  @import 'https://use.fontawesome.com/releases/v6.1.1/css/all.css';

  p {
    padding: 10px;
    border-radius: 5px;
  }

  [tabindex='0'] {
    cursor: pointer;
  }

  :global(.app-content) {
    flex: auto;
    overflow: auto;
    position: relative;
    flex-grow: 1;

    .main-content {
      overflow: hidden;
      display: flex;
      height: 100%;
      flex-grow: 1;
      z-index: -1;
      flex-direction: row;
      flex-wrap: wrap;
    }
  }

  $height: 100vh;

  @media (max-width: 768px) {
    $height: calc(100vh - 184px);
  }

  .content-container {
    position: absolute;
    display: flex;
    height: $height;
    width: 100%;
    overflow: auto;
    z-index: 0;
    flex-grow: 1;

    .drawer-container {
      position: relative;
      display: flex;
      height: $height;
      overflow: hidden;

      .drawer-content {
        overflow: auto;
        display: flex;
        flex-direction: column;
        flex-basis: 100%;
        flex: 1;
      }

      .drawer-divider {
        width: 9px;
        @media only screen and (max-width: 760px) {
          width: 15px;
        }

        background-color: #f4f7f9;
        cursor: ew-resize;
      }

      .custom-handle {
        position: relative;
        width: 8px;
        height: 100%;
        left: 25%;
        display: flex;
        align-items: center;
        pointer-events: none;
        color: black;
      }
    }
  }
</style>
