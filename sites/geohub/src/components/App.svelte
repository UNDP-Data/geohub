<script lang="ts">
  import type { Map as MaplibreMap } from 'maplibre-gl'
  import type { Split } from '@geoffcox/svelte-splitter/src'
  import Header from '$components/Header.svelte'
  import Map from '$components/Map.svelte'
  import Content from './Content.svelte'
  import { map as mapStore, layerList } from '$stores'
  import SplitterControl from '$components/SplitterControl.svelte'
  import { beforeNavigate, goto } from '$app/navigation'
  import { page } from '$app/stores'
  import Modal from '$components/controls/Modal.svelte'
  import { isEqual } from 'lodash-es'

  let map: MaplibreMap
  let headerHeight: number
  let isMenuShown = true
  let innerWidth: number
  let innerHeight: number
  let dialogOpen = false
  let cancel: () => void
  let toURL: URL
  let isContinueButtonClicked = false

  const openConfirmationModal = () => {
    dialogOpen = true
  }

  const handleCancel = () => {
    dialogOpen = false
  }
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel()
    }
  }

  const handleContinue = () => {
    isContinueButtonClicked = true
    layerList.update(() => [])
    goto(toURL.pathname)
    dialogOpen = false
  }
  const sortObject = (obj) => {
    if (typeof obj !== 'object' || Array.isArray(obj)) return obj
    return Object.keys(obj)
      .sort()
      .reduce((result, key) => {
        result[key] = sortObject(obj[key])
        return result
      }, {})
  }

  const styleChanged = () => {
    const currentSources = $mapStore.getStyle().sources
    const savedSources = $page.data.style?.style.sources
    const layersOnMap = $mapStore.getStyle().layers
    const savedLayers = $page.data.style?.style.layers
    const savedLayersOnMap = savedLayers?.filter((layer) => $layerList.find((l) => l.id === layer.id))
    const currentLayersOnMap = layersOnMap?.filter((layer) => $layerList.find((l) => l.id === layer.id))
    return (
      !isEqual(savedLayersOnMap, currentLayersOnMap) ||
      !isEqual(JSON.stringify(sortObject(currentSources)), JSON.stringify(sortObject(savedSources)))
    )
  }

  beforeNavigate(({ cancel, to }) => {
    if (isContinueButtonClicked || $layerList.length === 0 || !styleChanged()) {
      layerList.set([])
      return
    }
    if (to.url.pathname !== $page.url.pathname) {
      toURL = to.url
      cancel()
      openConfirmationModal()
    }
  })

  $: isMobile = innerWidth < 768
  $: splitHeight = innerHeight - headerHeight

  let splitControl: Split
</script>

<svelte:window
  bind:innerWidth
  bind:innerHeight />
<Header
  bind:drawerOpen={isMenuShown}
  bind:height={headerHeight} />
<SplitterControl
  bind:innerHeight
  bind:innerWidth
  bind:isMobile
  bind:isMenuShown
  bind:map={$mapStore}
  bind:splitHeight>
  <div slot="sidebar">
    <Content bind:splitterHeight={splitHeight} />
  </div>
  <div
    style="height: {splitHeight}px"
    slot="map">
    <Map bind:map={$mapStore} />
  </div>
</SplitterControl>
<Modal
  bind:dialogOpen
  on:cancel={handleCancel}
  on:continue={handleContinue}
  title="Are you sure you want to leave this page?"
  message="You have unsaved changes. If you leave this page, your changes will be lost."
  cancelText="Cancel"
  continueText="Continue" />

<style lang="scss">
</style>
