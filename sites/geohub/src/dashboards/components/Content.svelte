<script lang="ts">
  import { onMount } from 'svelte'
  import { MenuControl } from '@watergis/svelte-maplibre-menu'
  import { map } from '../stores'
  import { loadAdmin } from '../utils/adminLayer'
  import Charts from './Charts.svelte'
  import IntroductionPanel from './IntroductionPanel.svelte'
  import OverlayControl from './OverlayControl.svelte'
  import ElectricityControl from './ElectricityControl.svelte'
  import DownloadData from './DownloadData.svelte'

  let showIntro = true
  let electricitySelected: any
  let drawerWidth = 355
  let isResizingDrawer = false

  let loadRasterLayer = () => {
    return
  }

  onMount(() => {
    document.addEventListener('mousemove', (e) => handleMousemove(e))
    document.addEventListener('mouseup', handleMouseup)
    map.subscribe(() => {
      if ($map) {
        $map.on('load', () => {
          loadLayers()
        })
      }
    })
  })

  export function loadLayers() {
    loadRasterLayer()
    loadAdmin(true)
  }

  const handleMousemove = (e: MouseEvent | TouchEvent) => {
    if (!isResizingDrawer) return

    if (e instanceof MouseEvent) drawerWidth = e.clientX
    if (e instanceof TouchEvent) drawerWidth = e.touches?.[0].pageX
  }
  const handleMouseup = () => (isResizingDrawer = false)
</script>

<MenuControl
  bind:map={$map}
  position={'top-right'}
  isMenuShown={true}>
  <div
    slot="primary"
    class="drawer-content container m-0 p-4">
    <p class="title is-4 m-0 p-0 pb-2 has-text-centered">UNDP Electricity Dashboard</p>
    <IntroductionPanel bind:showIntro />

    {#if !showIntro}
      <div class="box mx-0 my-1">
        <p class="title is-5 p-0 m-0 has-text-centered pb-2">Raw Data - Electricity Access</p>
        <ElectricityControl
          bind:electricitySelected
          bind:loadRasterLayer />
      </div>
      <div class="box mx-0 my-1">
        <p class="title is-5 p-0 m-0 has-text-centered pb-2">Overlays</p>
        <OverlayControl />
      </div>
      <div class="box mx-0 my-1">
        <p class="title is-5 p-0 m-0 has-text-centered pb-2">Statistics - Electricity Access</p>
        <Charts />
      </div>
      <div class="box mx-0 my-1">
        <p class="title is-5 p-0 m-0 has-text-centered pb-2">Statistics - Download</p>
        <DownloadData />
      </div>
    {/if}
    <div />
  </div>
  <div
    slot="secondary"
    class="main-content">
    <slot />
  </div>
</MenuControl>

<style lang="scss">
  p {
    padding: 10px;
    border-radius: 5px;
  }

  .main-content {
    overflow: hidden;
    display: flex;
    height: 100%;
    flex-grow: 1;
    z-index: -1;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .drawer-content {
    width: 100%;
    height: 100vh;
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

  .heading-text {
    font-size: large;
    font-weight: bold;
    color: rgb(1, 1, 1, 0.6);
  }
</style>
