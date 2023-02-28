<script lang="ts">
  import { fade } from 'svelte/transition'
  import type { Map as MaplibreMap } from 'maplibre-gl'
  import { Split } from '@geoffcox/svelte-splitter/src'
  import Header from '$components/Header.svelte'
  import Map from '$components/Map.svelte'
  import { Button } from '@undp-data/svelte-undp-design'
  import Content from './Content.svelte'
  import { map as mapStore, layerList, isStyleEdited } from '$stores'
  import SplitterControl from '$components/SplitterControl.svelte'
  import { beforeNavigate, goto } from '$app/navigation'
  import Notification from '$components/controls/Notification.svelte'
  import { page } from '$app/stores'

  let map: MaplibreMap
  let headerHeight: number
  let isMenuShown = true
  let innerWidth: number
  let innerHeight: number
  let dialogOpen = false
  let cancel: () => void
  let toURL: URL
  let isContinueButtonClicked = false
  let settings = {
    sideBarPosition: 'left',
  }

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

  beforeNavigate(({ cancel, to }) => {
    if (isContinueButtonClicked || $layerList.length === 0 || !isStyleEdited) {
      return
    }
    if (to.url.pathname !== $page.url.pathname) {
      toURL = to.url
      cancel()
      openConfirmationModal()
    }
  })

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift()
  }

  let sideBarPosition: 'left' | 'right' = JSON.parse(getCookie('settings') || '{}').sideBarPosition || 'left'
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
  bind:splitHeight
  bind:sideBarPosition>
  <div slot="sidebar">
    <Content bind:splitterHeight={splitHeight} />
  </div>
  <div
    style="height: {splitHeight}px"
    slot="map">
    <Map bind:map={$mapStore} />
  </div>
</SplitterControl>
<div
  class="modal {dialogOpen ? 'is-active' : ''}"
  data-testid="delete-layer-view-container"
  transition:fade>
  <div
    class="modal-background"
    on:click={handleCancel}
    on:keydown={handleKeyDown} />
  <div class="modal-card">
    <header class="modal-card-head">
      <span class="modal-card-title">Do you want to exit this page?</span>
      <button
        class="delete"
        aria-label="close"
        title="Close Delete Layer Button"
        on:click={handleCancel} />
    </header>
    <section class="modal-card-body has-text-weight-normal">
      <Notification
        type="warning"
        showCloseButton={false}>
        <div class="has-text-weight-medium">
          Your current state of the application will be deleted when you go to a different page. Please save your map
          before continuing.
        </div>
      </Notification>
    </section>
    <footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
      <div class="footer-button px-2">
        <Button
          title="Cancel"
          isPrimary={false}
          on:clicked={handleCancel} />
      </div>
      <div class="footer-button px-2">
        <Button
          title="Continue"
          isPrimary={true}
          on:clicked={handleContinue} />
      </div>
    </footer>
  </div>
</div>

<style lang="scss">
</style>
