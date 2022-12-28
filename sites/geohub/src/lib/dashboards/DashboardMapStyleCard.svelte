<script lang="ts">
  import { fade } from 'svelte/transition'
  import { page } from '$app/stores'
  import { createEventDispatcher } from 'svelte'
  import { Map, type StyleSpecification } from 'maplibre-gl'
  import Time from 'svelte-time'
  import { clickOutside } from 'svelte-use-click-outside'
  import { Accordion, Button, CtaLink } from '@undp-data/svelte-undp-design'
  import type { DashboardMapStyle } from '$lib/types'

  const dispatch = createEventDispatcher()

  const url: URL = $page.url

  export let style: DashboardMapStyle
  export let isExpanded = false
  let mapContainer: HTMLDivElement
  let map: Map

  let showContextMenu = false
  let confirmDeleteDialogVisible = false

  $: if (mapContainer && isExpanded) {
    inistialise()
  }

  const inistialise = async () => {
    if (!mapContainer) return
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
  }

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
    dispatch('deleted', {
      style: style,
    })
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

<Accordion
  headerTitle={style.name}
  bind:isExpanded>
  <div
    slot="content"
    class="card-container px-1">
    <div class="tile p-2">
      <div class="tile is-half px-2">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="image pointor"
          on:click={() => window.open(style.viewer, '_blank')}
          bind:this={mapContainer} />
      </div>

      <div class="tile is-half is-vertical pl-4">
        <div class="tile">
          <p class="title is-5 style-name align-center">{style.name}</p>
        </div>
        <div class="tile">
          <p class="p-0 m-0">
            <b>Created at: </b><Time
              timestamp={style.createdat}
              format="h:mm A · MMMM D, YYYY" />
          </p>
        </div>
        <div class="tile">
          <p class="p-0 m-0">
            <b>Updated at: </b><Time
              timestamp={style.updatedat}
              format="h:mm A · MMMM D, YYYY" />
          </p>
        </div>
        <div class="tile is-12 py-4">
          <CtaLink
            label="Open map"
            on:clicked={() => window.open(style.viewer, '_blank')}
            isArrow={false} />
        </div>
        <div class="tile">
          <div class="tile is-half p-1">
            <Button
              title="Edit"
              isPrimary={true}
              on:clicked={() => window.open(style.editor, '_blank')} />
          </div>
          <div class="tile is-half p-1">
            <Button
              title="Delete"
              isPrimary={false}
              on:clicked={() => (confirmDeleteDialogVisible = true)} />
          </div>
        </div>
      </div>
    </div>
  </div>
</Accordion>

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
  .image {
    width: 100%;
    height: 200px;
  }

  :global(.accordion-header) {
    padding-left: 0.2rem !important;
  }

  p {
    text-transform: lowercase;
  }

  p::first-letter {
    text-transform: capitalize;
  }

  .pointor {
    cursor: pointer;
  }

  .align-center {
    width: max-content;
    margin: auto;
  }

  :global(.cta__link) {
    width: max-content;
    margin: auto;
  }
</style>
