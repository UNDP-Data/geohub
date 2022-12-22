<script lang="ts">
  import { fade } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { page } from '$app/stores'
  import { Map, type StyleSpecification } from 'maplibre-gl'
  import Time from 'svelte-time'
  import { clickOutside } from 'svelte-use-click-outside'
  import { Button, CtaLink } from '@undp-data/svelte-undp-design'
  import type { DashboardMapStyle } from '$lib/types'

  const url: URL = $page.url

  export let style: DashboardMapStyle
  let mapContainer: HTMLDivElement
  let nodeRef
  let map: Map

  let showContextMenu = false
  let confirmDeleteDialogVisible = false

  onMount(async () => {
    style.style = `${url.origin}/api/style/${style.id}.json`
    style.viewer = `${url.origin}/viewer?style=${style.style}`
    style.editor = `${url.origin}?style=${style.id}`

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
    const styleJSON: StyleSpecification = await res.json()

    map.setStyle(styleJSON)
    map.jumpTo({
      center: [styleJSON.center[0], styleJSON.center[1]],
      zoom: styleJSON.zoom,
      bearing: styleJSON.bearing,
      pitch: styleJSON.pitch,
    })
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
  class="tile is-ancestor m-4"
  bind:this={nodeRef}>
  <div class="tile is-vertical">
    <div class="tile border-bottom mb-2">
      <p class="title is-4 ml-1">{style.name}</p>
    </div>
    <div class="tile">
      <div
        class="image pointor"
        on:click={() => window.open(style.viewer, '_blank')}
        bind:this={mapContainer} />
    </div>
    <div class="tile pt-2">
      <div class="content">
        <p class="p-0 m-0">
          <b>Created at: </b><Time
            timestamp={style.createdat}
            format="h:mm A · MMMM D, YYYY" />
        </p>
        <p class="p-0 m-0">
          <b>Updated at: </b><Time
            timestamp={style.updatedat}
            format="h:mm A · MMMM D, YYYY" />
        </p>
      </div>
    </div>
    <div class="tile py-4">
      <CtaLink
        label="View Style"
        on:clicked={() => window.open(style.viewer, '_blank')}
        isArrow={false} />
    </div>
    <div class="tile pt-2">
      <div class="tile is-half pr-1">
        <Button
          title="Edit"
          isPrimary={true}
          on:clicked={() => window.open(style.editor, '_blank')} />
      </div>
      <div class="tile is-half pl-1">
        <Button
          title="Delete"
          isPrimary={false}
          on:clicked={() => (confirmDeleteDialogVisible = true)} />
      </div>
    </div>
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

<style lang="scss">
  .border-bottom {
    border-bottom: 3px solid gray;
  }

  .image {
    width: 100%;
    height: 250px;
  }

  .pointor {
    cursor: pointer;
  }
</style>
