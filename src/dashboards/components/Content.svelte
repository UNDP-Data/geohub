<script lang="ts">
  import { onMount } from 'svelte'
  import Drawer, { AppContent, Content } from '@smui/drawer'
  import { format } from 'd3-format'
  import { map, year } from '../stores'
  import SegmentedButton, { Segment, Label } from '@smui/segmented-button'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import vegaEmbed from 'vega-embed'
  import AdminLayer from '$lib/adminLayer'
  import { adminStore } from '$lib/stores/admin'
  import IntroductionPanel from './IntroductionPanel.svelte'
  import PovertyControl from './PovertyControl.svelte'
  import ElectricityControl from './ElectricityControl.svelte'

  const API_URL = import.meta.env.VITE_TITILER_ENDPOINT
  const AZURE_URL = import.meta.env.VITE_AZURE_URL

  let POVERTY_ID = 'poverty'
  const HREA_ID = 'HREA'
  const HREA_NODATA = -3.3999999521443642e38
  const ML_ID = 'ML'
  const ML_NODATA = 0
  const PRIMARY = '#1f77b4'
  const SECONDARY = '#ff7f0e'
  const GREY = '#808080'
  let adminLayer: AdminLayer = null

  let getHreaUrl = (y: number): string => {
    return
  }
  let getMlUrl = (y: number): string => {
    return
  }

  export let drawerOpen = false

  let controller = new AbortController()
  let pointDonutValue = { [HREA_ID]: 0, [ML_ID]: 0 }
  let pointBarValues = []
  let adminHistogram = []
  let adminHistogramAdmin = ''
  let adminHistogramStep = 1

  let showIntro = true
  $: showIntro, showIntroChanged()

  const showIntroChanged = () => {
    if (showIntro === true) return
    adminInteraction()
    loadHeatmap()
  }

  let electricitySelected
  let interactChoices = ['Admin', 'Point']
  let interactSelected = interactChoices[0]
  let drawerWidth = 355
  let isResizingDrawer = false

  let loadRasterLayer = () => {
    return
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

  const getAdminSpec = (values) => ({
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
          domain: [HREA_ID],
          range: [PRIMARY],
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
    adminHistogramAdmin = [
      $adminStore.adm4_name,
      $adminStore.adm3_name,
      $adminStore.adm2_name,
      $adminStore.adm1_name,
      $adminStore.adm0_name,
    ]
      .filter(Boolean)
      .join(', ')
    const options = { actions: false, renderer: 'svg' }
    adminHistogram = []
    for (let i = 2020; i >= 2012; i--) {
      adminHistogram.push({ year: i, value: $adminStore[`hrea_${i}`], category: HREA_ID })
    }
    vegaEmbed('#admin-histogram', getAdminSpec(adminHistogram), options)
    vegaEmbed('#admin-pie', getDonutSpec($adminStore[`hrea_${$year}`], PRIMARY), options)
  }

  const adminInteraction = () => {
    adminLayer?.setInteraction()
    $map.off('click', onPointClick)
    $map.on('mousemove', renderAdminCharts)
    renderAdminCharts()
  }

  const pointInteraction = () => {
    adminLayer?.removeInteraction()
    $map.on('click', onPointClick)
    $map.off('mousemove', renderAdminCharts)
    renderPointCharts()
  }

  $: interactSelected, loadInteraction()
  const loadInteraction = () => {
    if (!$map) return
    if (interactSelected === 'Admin') adminInteraction()
    else pointInteraction()
  }

  let loadHeatmap = () => {
    return
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
          <IntroductionPanel bind:showIntro />

          {#if !showIntro}
            <StyleControlGroup title="Layers">
              <ElectricityControl bind:electricitySelected bind:loadRasterLayer bind:getHreaUrl bind:getMlUrl />
              <PovertyControl bind:loadHeatmap bind:POVERTY_ID />
            </StyleControlGroup>

            <StyleControlGroup title="Statistics">
              <SegmentedButton segments={interactChoices} let:segment singleSelect bind:selected={interactSelected}>
                <Segment {segment}>
                  <Label>{segment}</Label>
                </Segment>
              </SegmentedButton>
              {#if interactSelected === 'Admin'}
                <br /><br />
                <div class="title-text">{electricitySelected?.name} Electrification - {$year}</div>
                <div class="title-text">{adminHistogramAdmin}</div>
                {#if $adminStore[`ppp_${$year}`]}
                  <div class="title-text">
                    <b
                      >{format('.3s')($adminStore[`ppp_hrea_${$year}`])
                        .replace('NaNM', 'N/A')
                        .replace('NaNk', 'N/A')}</b>
                    fully electrified
                  </div>
                  <div class="title-text">
                    <b>{format('.3s')($adminStore[`ppp_${$year}`]).replace('G', 'B')}</b> total
                  </div>
                {/if}
                <div id="admin-pie" />
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

  .chart-container {
    display: flex;
  }

  .chart-item {
    flex-grow: 1;
  }
</style>
