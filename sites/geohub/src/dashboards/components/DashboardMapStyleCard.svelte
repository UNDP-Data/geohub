<script lang="ts">
  import { fade } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { Map } from 'maplibre-gl'
  import Time from 'svelte-time'
  import { clickOutside } from 'svelte-use-click-outside'
  import { Button, CtaLink } from '@undp-data/svelte-undp-design'

  interface MapStyle {
    id: string
    name: string
    createdat: string
    style?: string
    viewer?: string
  }

  const url: URL = $page.url

  export let style: MapStyle
  let mapContainer: HTMLDivElement
  let nodeRef
  let map: Map

  let showContextMenu = false
  let confirmDeleteDialogVisible = false

  onMount(async () => {
    style.style = `${url.origin}/api/style/${style.id}.json`
    style.viewer = `${url.origin}/viewer?style=${style.style}`

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
    if (!style.style) return
    if (!map) return
    const res = await fetch(style.style)
    const styleJSON = await res.json()

    map.setStyle(style.style)
    map.setCenter(styleJSON.center ? styleJSON.center : [0, 0])
    map.setZoom(styleJSON.zoom ? styleJSON.zoom : 4)
  }

  const handleDeleteStyle = async () => {
    const res = await fetch(`../api/style/${style.id}`, {
      method: 'DELETE',
    })
    if (res.status === 204) {
      nodeRef.parentNode.removeChild(nodeRef)
    }
    confirmDeleteDialogVisible = false
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

<div
  class="cell small-3"
  bind:this={nodeRef}>
  <div
    class="content-card"
    style="border: none">
    <!-- svelte-ignore a11y-invalid-attribute -->
    <a aria-label={style.name}>
      <div style="display: flex;">
        <h6>{style.name}</h6>
        <span
          class="delete-button p-2 pr-4"
          role="button"
          on:click={() => {
            confirmDeleteDialogVisible = true
          }}>
          <i
            class="fa-solid fa-trash"
            style="color: black;" />
        </span>
      </div>
      <a
        href={style.viewer}
        target="_blank"
        rel="noreferrer">
        <div
          class="image"
          bind:this={mapContainer} />
        <div class="content-caption">
          <CtaLink
            label="View Style"
            on:clicked={() => window.open(style.viewer, '_blank')}
            isArrow={false} />
          <div style="display: flex; align-items: center; justify-content: space-between">
            <div class="content">
              <Time
                timestamp={style.createdat}
                format="h:mm A · MMMM D, YYYY" />
            </div>
          </div>
        </div>
      </a>
    </a>
  </div>
</div>

{#if confirmDeleteDialogVisible}
  <div
    class="modal is-active"
    transition:fade
    use:clickOutside={() => (confirmDeleteDialogVisible = false)}>
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
      <footer class="modal-card-foot">
        <div
          class="px-1"
          style="width: 50%">
          <Button
            title="Cancel"
            isPrimary={false}
            on:clicked={() => (confirmDeleteDialogVisible = false)} />
        </div>
        <div
          class="px-1"
          style="width: 50%">
          <Button
            title="Delete"
            isPrimary={true}
            on:clicked={handleDeleteStyle} />
        </div>
      </footer>
    </div>
  </div>
{/if}

<!--</div>-->
<style lang="scss">
  @use 'src/styles/undp-design/base-minimal.min.css';
  @use 'src/styles/undp-design/content-card.min.css';

  .delete-button {
    margin-left: auto;
  }

  #delete-style:hover {
    cursor: pointer;
    background: rgba(255, 0, 0, 0.1);
  }
  .card {
    margin: 5px;
    padding: 5px;
    width: 300px;
    min-height: 330px;
    cursor: pointer;
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
