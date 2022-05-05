<script lang="ts">
  import { LayerTypes } from '$lib/constants'
  import { onMount } from 'svelte'
  import Drawer, { AppContent, Content } from '@smui/drawer'
  import { map, year } from '../stores'
  import SegmentedButton, { Segment, Icon, Label } from '@smui/segmented-button'
  import Fa from 'svelte-fa'
  import { faPlugCircleBolt } from '@fortawesome/free-solid-svg-icons/faPlugCircleBolt'
  import { faLaptopCode } from '@fortawesome/free-solid-svg-icons/faLaptopCode'
  import Button from '@smui/button'
  import Paper from '@smui/paper'
  import FormField from '@smui/form-field'
  import Checkbox from '@smui/checkbox'
  import { fetchUrl } from '$lib/helper'
  import type {
    RasterLayerSpecification,
    HeatmapLayerSpecification,
    FillLayerSpecification,
    SourceSpecification,
    GeoJSONSourceSpecification,
    RasterSourceSpecification,
  } from '@maplibre/maplibre-gl-style-spec/types'
  import RangeSlider from 'svelte-range-slider-pips'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import TimeSlider from './TimeSlider.svelte'
  import vegaEmbed from 'vega-embed'

  const TOKEN = import.meta.env.VITE_AZURE_BLOB_TOKEN
  const API_URL = import.meta.env.VITE_TITILER_ENDPOINT
  const BING_MAPS_KEY = import.meta.env.VITE_BINGMAP_KEY
  const AZURE_URL = `https://undpngddlsgeohubdev01.blob.core.windows.net`
  const AERIAL_BING_URL = 'http://ecn.t3.tiles.virtualearth.net/tiles/a{quadkey}.jpeg?g=1'

  const RWI_URL = `${AZURE_URL}/test/rwi/rwi_adm1.geojson?${TOKEN}`

  let RWI_ID = 'rwi'
  const ADM_ID = 'admin'
  const ADM_LAYER = 'adm1_polygons'
  const HREA_ID = 'HREA'
  const HREA_NODATA = -3.3999999521443642e38
  const ML_ID = 'ML'
  const ML_NODATA = 0

  export const getHreaUrl = (y) => {
    return `${AZURE_URL}/electricity/High_Resolution_Electricity_Access/Electricity_Access/Electricity_access_estimate_${y}.tif?${TOKEN}`
  }
  export const getMlUrl = (y) => {
    return `${AZURE_URL}/electricity/Machine_Learning_Electricity_Access/Electricity_access_${y}.tif?${TOKEN}`
  }

  export let drawerOpen = false
  let hoveredStateId = null

  let pointDonutValue = {
    [HREA_ID]: 0,
    [ML_ID]: 0,
  }
  let pointBarValues = []

  let showIntro = true
  let heatmapChecked = false
  $: heatmapChecked, loadHeatmap()
  let electricityChoices = [
    { name: HREA_ID, icon: faPlugCircleBolt },
    { name: ML_ID, icon: faLaptopCode },
  ]
  let electricitySelected = electricityChoices[0]
  let interactChoices = ['Admin', 'Point']
  let interactSelected = interactChoices[0]
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
    adminInteraction()
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

  const getDonutSpec = (numerator, color) => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 120,
    height: 120,
    background: null,
    data: {
      values: [
        { category: 1, value: numerator },
        { category: 2, value: 1 - numerator },
      ],
    },
    mark: { type: 'arc', innerRadius: 30 },
    encoding: {
      theta: { field: 'value', type: 'quantitative' },
      color: {
        field: 'category',
        type: 'nominal',
        legend: null,
        scale: {
          domain: [1, 2],
          range: [color, '#808080'],
        },
      },
    },
  })

  const getBarSpec = (values) => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 278,
    height: 120,
    view: { stroke: 'transparent' },
    background: null,
    data: { values },
    mark: 'bar',
    encoding: {
      x: {
        field: 'year',
        axis: { title: false, labelColor: '#808080' },
        scale: {
          domain: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
        },
      },
      y: {
        field: 'value',
        type: 'quantitative',
        axis: null,
        scale: { domain: [0, 1] },
      },
      xOffset: { field: 'category' },
      color: { field: 'category', legend: null },
    },
  })

  onMount(() => {
    document.addEventListener('mousemove', (e) => handleMousemove(e))
    document.addEventListener('mouseup', handleMouseup)
    map.subscribe(() => {
      if ($map) {
        $map.on('load', () => {
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
    const layerSource: SourceSpecification = {
      type: LayerTypes.VECTOR,
      maxzoom: 10,
      promoteId: 'adm1_id',
      tiles: [`${AZURE_URL}/admin/${ADM_LAYER}/{z}/{x}/{y}.pbf`],
    }
    const layerFill: FillLayerSpecification = {
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

  const onMouseClick = (e) => {
    const { lng, lat } = $map.unproject(e.point)
    const options = [
      [HREA_ID, getHreaUrl, HREA_NODATA, [], 1],
      [ML_ID, getMlUrl, ML_NODATA, [2020], 255],
    ]
    pointBarValues = []
    for (const [name, getDataURL, noData, ignoreValue, total] of options) {
      for (let x = 2012; x <= 2020; x++) {
        if (!ignoreValue.includes(x)) {
          const url = `${API_URL}/point/${lng},${lat}?url=${getDataURL(x)}`
          const r = fetch(url)
            .then((r) => r.json())
            .then((response) => {
              const responseValue = response.values[0] === noData ? 0 : response.values[0] / total
              if (x === $year) {
                pointDonutValue[name] = responseValue
              }
              pointBarValues.push({ category: name, year: x, value: responseValue })
              renderPointCharts()
            })
        }
      }
    }
  }

  const renderPointCharts = () => {
    const options = { actions: false, renderer: 'svg' }
    vegaEmbed('#point-donut-1', getDonutSpec(pointDonutValue[HREA_ID], '#4C78A8'), options)
    vegaEmbed('#point-donut-2', getDonutSpec(pointDonutValue[ML_ID], '#F58419'), options)
    vegaEmbed('#point-bar', getBarSpec(pointBarValues), options)
  }

  const adminInteraction = () => {
    $map.on('mousemove', ADM_ID, onMouseMove)
    $map.on('mouseleave', ADM_ID, onMouseLeave)
    $map.off('click', onMouseClick)
  }

  const pointInteraction = () => {
    $map.off('mousemove', ADM_ID, onMouseMove)
    $map.off('mouseleave', ADM_ID, onMouseLeave)
    $map.on('click', onMouseClick)
    renderPointCharts()
  }

  $: interactSelected, loadInteraction()
  const loadInteraction = () => {
    if (!$map) return
    if (interactSelected === 'Admin') adminInteraction()
    else pointInteraction()
  }

  const initHeatmap = () => {
    if (!$map.getSource(RWI_ID)) {
      const layerSource: GeoJSONSourceSpecification = {
        type: 'geojson',
        data: RWI_URL,
        maxzoom: 9,
      }
      $map.addSource(RWI_ID, layerSource)
    }

    if (!$map.getLayer(RWI_ID)) {
      const layerDefinition: HeatmapLayerSpecification = {
        id: RWI_ID,
        type: LayerTypes.HEATMAP,
        source: RWI_ID,
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': {
            property: RWI_ID,
            type: 'exponential',
            stops: [
              [-0.855, 0],
              [1.06009, 1],
            ],
          },
          // use sequential color palette to use exponentially as the weight increases
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(0,140,0,0)',
            0.1,
            'rgb(104,255,0)',
            0.2,
            'rgb(150,255,0)',
            0.3,
            'rgb(195,255,0)',
            0.4,
            'rgb(255,255,0)',
            0.5,
            'rgb(255,222,0)',
            0.6,
            'rgb(255,208,0)',
            0.7,
            'rgb(255,180,0)',
            0.8,
            'rgb(255,132,0)',
            0.9,
            'rgb(255,80,0)',
            1.0,
            'rgb(255,0,0)',
          ],
          // increase intensity as zoom level increases
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          'heatmap-intensity': {
            stops: [
              [2, 1],
              [4, 3],
              [6, 5],
            ],
          },
          // increase radius as zoom increases
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          'heatmap-radius': {
            stops: [
              [0, 5],
              [1, 15],
              [2, 30],
              [3, 40],
              [4, 50],
              [5, 60],
              [6, 70],
              [7, 100],
              [8, 120],
              [9, 140],
            ],
          },
        },
      }
      $map.addLayer(layerDefinition)
    }
  }

  const moveHeatmap = () => {
    if (!$map) return
    let firstSymbolId = undefined
    for (const layer of $map.getStyle().layers) {
      if (layer.type === 'symbol') {
        firstSymbolId = layer.id
        break
      }
    }
    $map.moveLayer(RWI_ID, firstSymbolId)
  }

  const loadHeatmap = () => {
    if (!$map) return
    initHeatmap()
    $map.setLayoutProperty(RWI_ID, 'visibility', heatmapChecked ? 'visible' : 'none')
    $map.setPaintProperty(RWI_ID, 'heatmap-opacity', layerOpacity)
    moveHeatmap()
  }

  const addBingAerialLayer = async () => {
    if (aerialBingTiles.length == 0) {
      bingAerialLayerMeta = await fetchUrl(
        `https://dev.virtualearth.net/REST/v1/Imagery/Metadata/Aerial?key=${BING_MAPS_KEY}`,
      )
      const { resources } = bingAerialLayerMeta.resourceSets[0]
      const imageUrlSubdomains = resources[0].imageUrlSubdomains
      aerialBingTiles = imageUrlSubdomains.map((el) => {
        return AERIAL_BING_URL.replace('{subdomain}', el)
      })
    }
    const layerSource: RasterSourceSpecification = {
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
          <p class="heading-text">UNDP Electricity Dashboard</p>
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
              <Button variant="raised" on:click={hideIntro}>Explore Data</Button>
            </Paper>
          {/if}

          {#if !showIntro}
            <StyleControlGroup title="Layers">
              <p class="title-text">Electricity Access</p>
              <SegmentedButton
                segments={electricityChoices}
                let:segment
                singleSelect
                bind:selected={electricitySelected}>
                <Segment {segment}>
                  <div class="icon">
                    <Fa icon={segment.icon} size="lg" />
                  </div>
                  <Label>{segment.name}</Label>
                </Segment>
              </SegmentedButton>
              <div class="raster-time-slider">
                <TimeSlider bind:electricitySelected bind:BEFORE_LAYER_ID={RWI_ID} {AZURE_URL} />
              </div>
              <p class="title-text">Poverty</p>
              <FormField>
                <Checkbox bind:checked={heatmapChecked} />
                <span slot="label">Show Heatmap</span>
              </FormField>
              {#if heatmapChecked}
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
              {/if}
            </StyleControlGroup>

            <StyleControlGroup title="Statistics">
              <SegmentedButton segments={interactChoices} let:segment singleSelect bind:selected={interactSelected}>
                <Segment {segment}>
                  <Label>{segment}</Label>
                </Segment>
              </SegmentedButton>
              {#if interactSelected === 'Point'}
                <br /><br />
                <div class="chart-container">
                  <div class="chart-item">
                    <p class="title-text">HREA</p>
                    <div id="point-donut-1" />
                  </div>
                  <div class="chart-item">
                    <p class="title-text">ML</p>
                    <div id="point-donut-2" />
                  </div>
                </div>
                <div id="point-bar" />
              {/if}
            </StyleControlGroup>
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

  .heading-text {
    font-size: large;
    font-weight: bold;
    color: rgb(1, 1, 1, 0.6);

    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }

  .title-text {
    font-size: 14px;
    color: rgb(1, 1, 1, 0.6);
    font-weight: normal;

    @media (prefers-color-scheme: dark) {
      color: white;
    }
  }

  .raster-time-slider {
    padding-top: 1em;
    padding-bottom: 1em;
  }

  .chart-container {
    display: flex;
  }

  .chart-item {
    flex-grow: 1;
  }

  .icon {
    padding-left: 10px;
    padding-right: 20px;
  }
</style>
