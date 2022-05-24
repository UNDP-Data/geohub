<script lang="ts">
  import { LayerTypes } from '$lib/constants'
  import { onMount } from 'svelte'
  import Drawer, { AppContent, Content } from '@smui/drawer'
  import { map, year } from '../stores'
  import SegmentedButton, { Segment, Label } from '@smui/segmented-button'
  import Fa from 'svelte-fa'
  import { faPlugCircleBolt } from '@fortawesome/free-solid-svg-icons/faPlugCircleBolt'
  import { faLaptopCode } from '@fortawesome/free-solid-svg-icons/faLaptopCode'
  import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
  import Button from '@smui/button'
  import Paper from '@smui/paper'
  import FormField from '@smui/form-field'
  import Checkbox from '@smui/checkbox'
  import type { HeatmapLayerSpecification, VectorSourceSpecification } from '@maplibre/maplibre-gl-style-spec/types'
  import RangeSlider from 'svelte-range-slider-pips'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import TimeSlider from './TimeSlider.svelte'
  import vegaEmbed from 'vega-embed'
  import AdminLayer from '$lib/adminLayer'
  import IntroPanel from './IntroPanel.svelte'

  const TOKEN = import.meta.env.VITE_AZURE_BLOB_TOKEN
  const API_URL = import.meta.env.VITE_TITILER_ENDPOINT
  const AZURE_URL = import.meta.env.VITE_AZURE_URL

  const POVERTY_URL = [`${AZURE_URL}/admin/poverty_points/{z}/{x}/{y}.pbf`]

  let POVERTY_ID = 'poverty'
  const HREA_ID = 'HREA'
  const HREA_NODATA = -3.3999999521443642e38
  const ML_ID = 'ML'
  const ML_NODATA = 0
  const NONE_ID = 'NONE'
  const PRIMARY = '#1f77b4'
  const SECONDARY = '#ff7f0e'
  const GREY = '#808080'
  let adminLayer: AdminLayer = null

  export const getHreaUrl = (y) => {
    return `${AZURE_URL}/electricity/High_Resolution_Electricity_Access/Electricity_Access/Electricity_access_estimate_${y}.tif?${TOKEN}`
  }
  export const getMlUrl = (y) => {
    return `${AZURE_URL}/electricity/Machine_Learning_Electricity_Access/Electricity_access_${y}.tif?${TOKEN}`
  }

  export let drawerOpen = false

  let controller = new AbortController()
  let pointDonutValue = { [HREA_ID]: 0, [ML_ID]: 0 }
  let pointBarValues = []
  let adminHistogram = []
  let adminHistogramAdmin = ''
  let adminHistogramStep = 1

  let showIntro = true
  $: showIntro, adminInteraction()
  let heatmapChecked = false
  $: heatmapChecked, loadHeatmap()
  let electricityChoices = [
    { name: HREA_ID, icon: faPlugCircleBolt },
    { name: ML_ID, icon: faLaptopCode },
    { name: NONE_ID, icon: faBan },
  ]
  let electricitySelected = electricityChoices[0]
  let interactChoices = ['Admin', 'Point']
  let interactSelected = interactChoices[0]
  let drawerWidth = 355
  let isResizingDrawer = false

  let layerOpacity = 1
  let rangeSliderValues = [layerOpacity * 100]
  let loadRasterLayer = () => {
    return
  }
  $: layerOpacity = rangeSliderValues[0] / 100
  $: layerOpacity, setLayerOpacity()

  const setLayerOpacity = () => {
    if ($map && $map.getLayer(POVERTY_ID)) {
      $map.setPaintProperty(POVERTY_ID, 'heatmap-opacity', layerOpacity)
    }
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

  const getDonutSpec = (value, color) => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 120,
    height: 120,
    background: null,
    data: {
      values: [
        { category: 1, value, percent: Math.round(value * 100) + '%' },
        { category: 2, value: 1 - value, percent: '' },
      ],
    },
    mark: { type: 'arc', innerRadius: 30 },
    encoding: {
      theta: { field: 'value', type: 'quantitative' },
      tooltip: { field: 'percent', type: 'qualitative' },
      color: {
        field: 'category',
        type: 'nominal',
        legend: null,
        scale: {
          domain: [1, 2],
          range: [color, GREY],
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
    mark: { type: 'bar' },
    encoding: {
      x: {
        field: 'year',
        axis: { title: false, labelColor: GREY },
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
      tooltip: { field: 'percent', type: 'qualitative' },
      xOffset: { field: 'category' },
      color: {
        field: 'category',
        legend: null,
        scale: {
          domain: [HREA_ID, ML_ID],
          range: [PRIMARY, SECONDARY],
        },
      },
    },
  })

  const getHistogramSpec = (values) => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 278,
    height: 120,
    view: { stroke: 'transparent' },
    background: null,
    data: { values },
    mark: { type: 'bar', color: PRIMARY },
    encoding: {
      x: {
        field: 'bin1',
        type: 'quantitative',
        bin: { binned: true, step: adminHistogramStep },
        axis: { title: false, labelColor: GREY, format: '.0%' },
      },
      x2: { field: 'bin2' },
      y: { field: 'count', type: 'quantitative', axis: null },
    },
  })

  export function loadLayers() {
    loadRasterLayer()
    loadHeatmap()
    adminLayer = new AdminLayer($map, AZURE_URL)
    adminLayer.load()
  }
  onMount(() => {
    document.addEventListener('mousemove', (e) => handleMousemove(e))
    document.addEventListener('mouseup', handleMouseup)
    map.subscribe(() => {
      if ($map) {
        $map.on('load', () => {
          setContentContainerMargin(drawerWidth)
          loadLayers()
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

  const getAdminGeoJSONUrl = (admin_props) => {
    const lvl = adminLayer?.getAdminLevel()
    const filtered = Object.keys(admin_props)
      .filter((key) => key.includes(lvl) && key.endsWith('id'))
      .reduce((obj, key) => {
        obj['admin_id'] = admin_props[key]
        return obj
      }, {})
    const { admin_id } = filtered
    return `${AZURE_URL}/admin/adm${lvl}_polygons_geojson/${admin_id}.geojson`
  }

  const getAdminStats = async (e) => {
    const lurl = electricitySelected.name == 'HREA' ? getHreaUrl($year) : getMlUrl($year)
    const total = electricitySelected.name == 'HREA' ? 1 : 255

    const features = $map.queryRenderedFeatures(e.point, { layers: [adminLayer.getAdminID()] })
    if (features.length > 0) {
      controller.abort()
      controller = new AbortController()
      const { type, geometry, properties } = features[0].toJSON()
      //const geoJSON = { type, geometry, properties }
      const adminIdUrl = getAdminGeoJSONUrl(features[0].toJSON().properties)
      const apiUrlParams = { url: lurl, geojson_url: adminIdUrl }

      const config = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        //mode: 'no-cors',
        signal: controller.signal,
      }

      const url = `${API_URL}/geojsonstats?${new URLSearchParams(apiUrlParams).toString()}`
      //const url = `http://localhost:8000/hrea/geojsonstats?${new URLSearchParams(apiUrlParams).toString()}`
      // const stats = await fetchUrl(url, config)
      // console.log(JSON.stringify(stats, null, '\t'))
      adminHistogram = []
      adminHistogramStep = 1
      adminHistogramAdmin = ''
      renderAdminCharts()
      try {
        const response = await fetch(url, config)
        if (response.ok) {
          const result = await response.json()
          //console.log(JSON.stringify(result, null, '\t'))
          const {
            histogram: [values, bins],
          } = result['1']
          adminHistogramAdmin = [
            properties.adm0_name,
            properties.adm1_name,
            properties.adm2_name,
            properties.adm3_name,
            properties.adm4_name,
          ]
            .filter(Boolean)
            .join(', ')
          adminHistogramStep = (bins[1] - bins[0]) / total
          adminHistogram = values.map((x, i) => ({
            count: x,
            bin1: bins[i] / total,
            bin2: bins[i + 1] / total,
          }))
          renderAdminCharts()
        } else {
          throw new Error(`Network response was ${response}`)
        }
      } catch (error) {
        console.error(error.name, error.message)
      }
    }
  }

  const geoJSONStats = async (e) => {
    const lurl = electricitySelected.name == 'HREA' ? getHreaUrl($year) : getMlUrl($year)
    const total = electricitySelected.name == 'HREA' ? 1 : 255
    const apiUrlParams = { url: lurl }
    const features = $map.queryRenderedFeatures(e.point, { layers: [adminLayer.getAdminID()] })
    if (features.length > 0) {
      controller.abort()
      controller = new AbortController()
      const { type, geometry, properties } = features[0].toJSON()
      const geoJSON = { type, geometry, properties }
      const config = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(geoJSON),
        signal: controller.signal,
      }
      const url = `${API_URL}/statistics?${new URLSearchParams(apiUrlParams).toString()}`
      adminHistogram = []
      adminHistogramStep = 1
      adminHistogramAdmin = ''
      renderAdminCharts()
      try {
        const response = await fetch(url, config)
        if (response.ok) {
          const result = await response.json()
          const {
            histogram: [values, bins],
          } = result.properties.statistics['1']
          adminHistogramAdmin = [
            properties.adm0_name,
            properties.adm1_name,
            properties.adm2_name,
            properties.adm3_name,
            properties.adm4_name,
          ]
            .filter(Boolean)
            .join(', ')
          adminHistogramStep = (bins[1] - bins[0]) / total
          adminHistogram = values.map((x, i) => ({
            count: x,
            bin1: bins[i] / total,
            bin2: bins[i + 1] / total,
          }))
          renderAdminCharts()
        } else {
          throw new Error('Network response was not ok.')
        }
      } catch (error) {
        console.error(error.name, error.message)
      }
    }
  }

  const onPointClick = (e) => {
    const { lng, lat } = $map.unproject(e.point)
    const options = [
      [HREA_ID, getHreaUrl, HREA_NODATA, [], 1],
      [ML_ID, getMlUrl, ML_NODATA, [2020], 255],
    ]
    pointDonutValue = { [HREA_ID]: 0, [ML_ID]: 0 }
    pointBarValues = []
    renderPointCharts()
    controller.abort()
    controller = new AbortController()
    for (const [name, getDataURL, noData, ignoreValue, total] of options) {
      for (let x = 2012; x <= 2020; x++) {
        if (!ignoreValue.includes(x)) {
          const url = `${API_URL}/point/${lng},${lat}?url=${getDataURL(x)}`
          fetch(url, { signal: controller.signal })
            .then((r) => r.json())
            .then((response) => {
              const responseValue = response.values[0] === noData ? 0 : response.values[0] / total
              if (x === $year) {
                pointDonutValue[name] = responseValue
              }
              pointBarValues.push({
                category: name,
                year: x,
                value: responseValue,
                percent: Math.round(responseValue * 100) + '%',
              })
              renderPointCharts()
            })
        }
      }
    }
  }

  const renderPointCharts = () => {
    const options = { actions: false, renderer: 'svg' }
    vegaEmbed('#point-donut-1', getDonutSpec(pointDonutValue[HREA_ID], PRIMARY), options)
    vegaEmbed('#point-donut-2', getDonutSpec(pointDonutValue[ML_ID], SECONDARY), options)
    vegaEmbed('#point-bar', getBarSpec(pointBarValues), options)
  }

  const renderAdminCharts = () => {
    const options = { actions: false, renderer: 'svg' }
    vegaEmbed('#admin-histogram', getHistogramSpec(adminHistogram), options)
  }

  const adminInteraction = () => {
    adminLayer?.setInteraction()
    $map.off('click', onPointClick)
    $map.on('click', getAdminStats)
    renderAdminCharts()
  }

  const pointInteraction = () => {
    adminLayer?.removeInteraction()
    $map.on('click', onPointClick)
    $map.off('click', getAdminStats)
    renderPointCharts()
  }

  $: interactSelected, loadInteraction()
  const loadInteraction = () => {
    if (!$map) return
    if (interactSelected === 'Admin') adminInteraction()
    else pointInteraction()
  }

  const initHeatmap = () => {
    if (!$map.getSource(POVERTY_ID)) {
      const layerSource: VectorSourceSpecification = {
        type: 'vector',
        tiles: POVERTY_URL,
        maxzoom: 10,
      }
      $map.addSource(POVERTY_ID, layerSource)
    }

    if (!$map.getLayer(POVERTY_ID)) {
      const layerDefinition: HeatmapLayerSpecification = {
        id: POVERTY_ID,
        type: LayerTypes.HEATMAP,
        source: POVERTY_ID,
        'source-layer': POVERTY_ID + '_points',
        layout: { visibility: 'none' },
        paint: {
          'heatmap-weight': ['interpolate', ['exponential', 2], ['get', POVERTY_ID], 0, 0, 2.022, 1],
          'heatmap-intensity': ['interpolate', ['exponential', 2], ['zoom'], 0, 0, 10, 5],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 0, 10, 30],
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
    $map.moveLayer(POVERTY_ID, firstSymbolId)
  }

  const loadHeatmap = () => {
    if (!$map) return
    initHeatmap()
    $map.setLayoutProperty(POVERTY_ID, 'visibility', heatmapChecked ? 'visible' : 'none')
    $map.setPaintProperty(POVERTY_ID, 'heatmap-opacity', layerOpacity)
    moveHeatmap()
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
          <IntroPanel bind:showIntro />

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
                <TimeSlider
                  bind:electricitySelected
                  bind:loadLayer={loadRasterLayer}
                  bind:BEFORE_LAYER_ID={POVERTY_ID}
                  {AZURE_URL} />
              </div>
              <FormField>
                <Checkbox bind:checked={heatmapChecked} />
                <p class="title-text">Poverty</p>
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
              {#if interactSelected === 'Admin'}
                <br /><br />
                <div class="title-text">{electricitySelected.name} Histogram - {$year}</div>
                <div class="title-text">{adminHistogramAdmin}</div>
                <div id="admin-histogram" />
              {/if}
              {#if interactSelected === 'Point'}
                <br /><br />
                <div class="chart-container">
                  <div class="chart-item">
                    <p class="title-text">HREA - {$year}</p>
                    <div id="point-donut-1" />
                  </div>
                  <div class="chart-item">
                    <p class="title-text">ML - {$year}</p>
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
