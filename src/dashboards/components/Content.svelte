<script lang="ts">
  import { onMount } from 'svelte'
  import type { VisualizationSpec } from 'svelte-vega'
  import { VegaLite } from 'svelte-vega'
  import Drawer, { AppContent, Content } from '@smui/drawer'
  import { map, year, admin } from '../stores'
  import SegmentedButton, { Segment, Label } from '@smui/segmented-button'
  import StyleControlGroup from '$components/control-groups/StyleControlGroup.svelte'
  import { loadAdmin, setInteraction, removeInteraction } from '../utils/adminLayer'
  import IntroductionPanel from './IntroductionPanel.svelte'
  import PovertyControl from './PovertyControl.svelte'
  import ElectricityControl from './ElectricityControl.svelte'

  const API_URL = import.meta.env.VITE_TITILER_ENDPOINT

  let POVERTY_ID = 'poverty'
  const HREA_ID = 'HREA'
  const HREA_NODATA = -3.3999999521443642e38
  const ML_ID = 'ML'
  const ML_NODATA = 0
  const PRIMARY = '#1f77b4'
  const SECONDARY = '#ff7f0e'
  const GREY = '#808080'
  const HOVER = 'Hover'
  const CLICK = 'Click'

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
  let adminDonutValue = { [HREA_ID]: 0 }
  let adminHistogram = []
  let adminHistogramAdmin = ''
  let pointClicked = ''
  let showIntro = true
  let electricitySelected: any
  let interactChoices = [HOVER, CLICK]
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

  const getDonutValues = (value) => ({
    values: [
      { category: 1, value, percent: Math.round(value * 100) + '%' },
      { category: 2, value: 1 - value, percent: '' },
    ],
  })

  const getDonutSpec = (color): VisualizationSpec => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 120,
    height: 120,
    background: null,
    data: { name: 'values' },
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

  const getBarSpec = (): VisualizationSpec => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    padding: 0,
    width: 258,
    height: 120,
    view: { stroke: 'transparent' },
    background: null,
    data: { name: 'values' },
    mark: 'bar',
    encoding: {
      x: {
        field: 'year',
        axis: { title: null, labelColor: GREY },
        scale: {
          domain: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
        },
      },
      y: {
        field: 'value',
        type: 'quantitative',
        axis: { title: null, labelColor: GREY, ticks: false, tickCount: 5, grid: false, format: ',.0%' },
        scale: { domain: [0, 1] },
      },
      tooltip: { field: 'value', type: 'quantitative', format: ',.0%' },
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

  const getAdminSpec = (): VisualizationSpec => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    padding: 0,
    width: 288,
    height: 120,
    view: { stroke: 'transparent' },
    background: null,
    data: { name: 'values' },
    layer: [
      { mark: 'bar' },
      {
        mark: { type: 'text', align: 'center', baseline: 'middle', dy: -10 },
        encoding: {
          text: { field: 'value', type: 'quantitative', format: ',.0%' },
        },
      },
    ],
    encoding: {
      x: {
        field: 'year',
        axis: { title: null, labelColor: GREY },
        scale: {
          domain: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020],
        },
      },
      y: {
        field: 'value',
        type: 'quantitative',
        axis: { title: null, grid: false, ticks: false, labels: false },
        scale: { domain: [0, 1] },
      },
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

  export function loadLayers() {
    loadRasterLayer()
    setInteraction()
    adminInteraction()
    loadAdmin(true)
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

  const onPointClick = (e) => {
    const { lng, lat } = $map.unproject(e.point)
    const options = [
      [HREA_ID, getHreaUrl, HREA_NODATA, [], 1],
      [ML_ID, getMlUrl, ML_NODATA, [2020], 255],
    ]
    pointDonutValue = { [HREA_ID]: 0, [ML_ID]: 0 }
    pointBarValues = []
    pointClicked = `Latitude: ${lat.toFixed(4)}, Longitude: ${lng.toFixed(4)}`
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
              pointBarValues = [
                ...pointBarValues,
                {
                  category: name,
                  year: x,
                  value: responseValue,
                },
              ]
            })
        }
      }
    }
  }

  const renderAdminCharts = () => {
    adminDonutValue = { [HREA_ID]: $admin[`hrea_${$year}`] }
    adminHistogramAdmin = [$admin.adm4_name, $admin.adm3_name, $admin.adm2_name, $admin.adm1_name, $admin.adm0_name]
      .filter(Boolean)
      .join(', ')
    adminHistogram = []
    for (let i = 2020; i >= 2012; i--) {
      adminHistogram = [...adminHistogram, { year: i, value: $admin[`hrea_${i}`], category: HREA_ID }]
    }
  }

  const adminInteraction = () => {
    adminDonutValue = { [HREA_ID]: 0 }
    adminHistogram = []
    adminHistogramAdmin = ''
    setInteraction()
    $map.off('click', onPointClick)
    $map.on('mousemove', renderAdminCharts)
  }

  const pointInteraction = () => {
    pointDonutValue = { [HREA_ID]: 0, [ML_ID]: 0 }
    pointBarValues = []
    removeInteraction()
    $map.on('click', onPointClick)
    $map.off('mousemove', renderAdminCharts)
  }

  $: interactSelected, loadInteraction()
  const loadInteraction = () => {
    if (!$map) return
    if (interactSelected === HOVER) adminInteraction()
    else pointInteraction()
  }

  let loadHeatmap = () => {
    return
  }

  let vegaOptions = { actions: false, renderer: 'svg' }
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
            <StyleControlGroup title="Raw Data - Electricity Access">
              <ElectricityControl bind:electricitySelected bind:loadRasterLayer bind:getHreaUrl bind:getMlUrl />
            </StyleControlGroup>
            <StyleControlGroup title="Overlays">
              <PovertyControl bind:loadHeatmap bind:POVERTY_ID />
            </StyleControlGroup>
            <StyleControlGroup title="Statistics - Electricity Access">
              <div class="centered">
                <SegmentedButton segments={interactChoices} let:segment singleSelect bind:selected={interactSelected}>
                  <Segment {segment}>
                    <Label>{segment}</Label>
                  </Segment>
                </SegmentedButton>
              </div>
              {#if interactSelected === HOVER}
                <br />
                <div class="title-text">Population fully electrified:</div>
                <div class="title-text admin-histogram">{adminHistogramAdmin}</div>
                <br />
                <VegaLite data={{ values: adminHistogram }} spec={getAdminSpec()} options={vegaOptions} />
              {/if}
              {#if interactSelected === CLICK}
                <br />
                <div class="title-text">Population fully electrified:</div>
                <div class="title-text">{pointClicked}</div>
                <br />
                <VegaLite data={{ values: pointBarValues }} spec={getBarSpec()} options={vegaOptions} />
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

<!-- <VegaLite
  data={getDonutValues(adminDonutValue[HREA_ID])}
  spec={getDonutSpec(PRIMARY)}
  options={vegaOptions} /> -->

<!-- <div class="chart-container">
  <div class="chart-item">
    <p class="title-text">HREA - {$year}</p>
    <VegaLite
      data={getDonutValues(pointDonutValue[HREA_ID])}
      spec={getDonutSpec(PRIMARY)}
      options={vegaOptions} />
  </div>
  <div class="chart-item">
    <p class="title-text">ML - {$year}</p>
    <VegaLite
      data={getDonutValues(pointDonutValue[ML_ID])}
      spec={getDonutSpec(SECONDARY)}
      options={vegaOptions} />
  </div>
</div> -->
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

  .admin-histogram {
    min-height: 21px;
  }

  .chart-container {
    display: flex;
  }

  .chart-item {
    flex-grow: 1;
  }
</style>
