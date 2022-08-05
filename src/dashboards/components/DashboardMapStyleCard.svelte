<script lang="ts">
  import { fade } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { Map } from 'maplibre-gl'
  import Time from 'svelte-time'
  import Fa from 'svelte-fa'
  import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons/faEllipsisVertical'
  import { clickOutside } from 'svelte-use-click-outside'
  import Popper from '$lib/popper'
  import type { BannerMessage } from '$lib/types'
  import { ErrorMessages, StatusTypes } from '$lib/constants'
  import { bannerMessages } from '$stores'

  interface MapStyle {
    id: string
    name: string
    createdat: string
    style: string
    viewer: string
  }

  export let style: MapStyle
  let mapContainer: HTMLDivElement
  let nodeRef
  let map: Map

  const {
    ref: popperRef,
    options: popperOptions,
    content: popperContent,
  } = new Popper(
    {
      placement: 'bottom',
      strategy: 'absolute',
    },
    [-30, 0],
  ).init()

  let showContextMenu = false
  let confirmDeleteDialogVisible = false

  onMount(async () => {
    const res = await fetch(style.style)
    const styleJSON = await res.json()

    map = new Map({
      container: mapContainer,
      style: style.style,
      center: styleJSON.center ? styleJSON.center : [0, 0],
      zoom: styleJSON.zoom ? styleJSON.zoom : 4,
      attributionControl: false,
      interactive: false,
    })
  })

  $: style, updateStyle()
  const updateStyle = async () => {
    if (!style) return
    if (!map) return
    const res = await fetch(style.style)
    const styleJSON = await res.json()

    map.setStyle(style.style)
    map.setCenter(styleJSON.center ? styleJSON.center : [0, 0])
    map.setZoom(styleJSON.zoom ? styleJSON.zoom : 4)
  }

  const handleDeleteStyle = () => {
    fetch(`../style/${style.id}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.status === 204) {
          nodeRef.parentNode.removeChild(nodeRef)
        } else {
          const bannerErrorMessage: BannerMessage = {
            type: StatusTypes.DANGER,
            title: 'Whoops! Something went wrong.',
            message: ErrorMessages.NO_STYLE_EXISTS,
          }
          bannerMessages.update((data) => [...data, bannerErrorMessage])
        }
      })
      .catch((err) => {
        const bannerErrorMessage: BannerMessage = {
          type: StatusTypes.DANGER,
          title: 'Whoops! Something went wrong.',
          message: ErrorMessages.FETCH_TIMEOUT,
          error: err,
        }
        bannerMessages.update((data) => [...data, bannerErrorMessage])
      })
  }

  const handleClose = () => {
    showContextMenu = false
  }

  $: {
    if (showContextMenu !== true) {
      setTimeout(handleClose, 100)
    }
  }
</script>

<div bind:this={nodeRef}>
  <div class="card">
    <a href={style.viewer} target="_blank">
      <div class="card-image">
        <div class="map" id="map" bind:this={mapContainer} />
      </div>
    </a>
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <a href={style.viewer} target="_blank">
            <p class="title is-5">{style.name}</p>
          </a>
        </div>
        <div class="container icon" use:popperRef on:click={() => (showContextMenu = !showContextMenu)}>
          <Fa icon={faEllipsisVertical} size="sm" />
        </div>
      </div>

      <a href={style.viewer} target="_blank">
        <div class="content">
          <Time timestamp={style.createdat} format="h:mm A · MMMM D, YYYY" />
        </div>
      </a>
    </div>
  </div>

  {#if showContextMenu}
    <div
      id="tooltip"
      data-testid="tooltip"
      use:popperContent={popperOptions}
      transition:fade
      use:clickOutside={handleClose}>
      <aside class="menu">
        <ul class="menu-list">
          <li
            on:click={() => {
              confirmDeleteDialogVisible = true
            }}>
            <a>Delete</a>
          </li>
        </ul>
      </aside>
    </div>
  {/if}

  {#if confirmDeleteDialogVisible}
    <div class="modal is-active" transition:fade use:clickOutside={() => (confirmDeleteDialogVisible = false)}>
      <div class="modal-background" />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Delete Style</p>
          <button
            class="delete"
            aria-label="close"
            alt="Close"
            title="Close"
            on:click={() => (confirmDeleteDialogVisible = false)} />
        </header>
        <section class="modal-card-body is-size-6 has-text-weight-normal">
          <div class="has-text-weight-medium">Are you sure you want to delete this style?</div>
          <br />
          {style.name}
        </section>
        <footer class="modal-card-foot is-flex is-flex-direction-row is-justify-content-flex-end">
          <div>
            <button
              class="button"
              alt="Cancel Delete Layer Button"
              title="Cancel Delete Layer Button"
              on:click={() => (confirmDeleteDialogVisible = false)}>
              Cancel
            </button>

            <button class="button is-danger" alt="Delete" title="Delete" on:click={handleDeleteStyle}>Delete</button>
          </div>
        </footer>
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  @import 'https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css';
  @import '../../styles/popper.scss';

  .card {
    margin: 5px;
    padding: 5px;
    width: 300px;
    min-height: 330px;
    cursor: pointer;
  }

  .map {
    width: 100%;
    height: 100%;
  }

  .icon {
    cursor: pointer;
  }

  #tooltip {
    position: relative;
    padding: 0px;
    border-radius: 0px;
  }
</style>
