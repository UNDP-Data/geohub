<script lang="ts">
  import { fade } from 'svelte/transition'
  import { page } from '$app/stores'
  import { createEventDispatcher, onMount } from 'svelte'
  import { Map, type StyleSpecification } from 'maplibre-gl'
  import Time from 'svelte-time'
  import { clickOutside } from 'svelte-use-click-outside'
  import { Accordion, Button, CtaLink, Loader } from '@undp-data/svelte-undp-design'
  import type { DashboardMapStyle } from '$lib/types'
  import { AccessLevel } from '$lib/AppConfig'
  import { sleep } from '$lib/helper'

  const dispatch = createEventDispatcher()

  const url: URL = $page.url

  export let style: DashboardMapStyle
  export let isExpanded = false
  let mapContainer: HTMLDivElement
  let map: Map
  let isLoading = false

  let showContextMenu = false
  let confirmDeleteDialogVisible = false

  let styleJSON: StyleSpecification

  let headerIcon = ''

  onMount(async () => {
    await inistialise()
  })

  $: if (mapContainer && isExpanded) {
    inistialiseMap()
  }

  const inistialise = async () => {
    style.style = `${url.origin}/api/style/${style.id}.json`
    style.editor = `${url.origin}?style=${style.id}`
  }

  const inistialiseMap = async () => {
    if (!mapContainer) return
    if (map) return
    try {
      isLoading = true

      const res = await fetch(style.style)
      styleJSON = await res.json()

      while (mapContainer === null) {
        await sleep(100)
      }

      map = new Map({
        container: mapContainer,
        style: styleJSON,
        center: styleJSON.center ? [styleJSON.center[0], styleJSON.center[1]] : [0, 0],
        zoom: styleJSON.zoom ? styleJSON.zoom : 4,
        attributionControl: false,
        interactive: false,
      })

      if (map.loaded()) {
        isLoading = false
      } else {
        map.on('load', () => {
          isLoading = false
        })
      }
    } catch (err) {
      console.error(err)
      isLoading = false
    }
  }

  const handleDeleteStyle = async () => {
    const res = await fetch(`../api/style/${style.id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      dispatch('deleted', {
        style: style,
      })
      confirmDeleteDialogVisible = false
    }
  }

  const handleClose = () => {
    showContextMenu = false
  }

  $: {
    if (showContextMenu !== true) {
      setTimeout(handleClose, 100)
    }
  }

  if (style.access_level) {
    if (style.access_level === AccessLevel.PRIVATE) {
      headerIcon = 'fa-solid fa-user-lock has-text-primary'
    } else if (style.access_level === AccessLevel.ORGANIZATION) {
      headerIcon = 'fa-solid fa-building-lock has-text-primary'
    } else {
      headerIcon = 'fa-solid fa-lock-open has-text-primary'
    }
  }
</script>

<Accordion
  headerTitle={style.name}
  bind:headerIcon
  bind:isExpanded>
  <div
    slot="button"
    hidden={isExpanded}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span
      class="icon open-button has-tooltip-left has-tooltip-arrow"
      role="button"
      tabindex="0"
      data-tooltip="Open map"
      on:click={() => window.open(style.editor, '_blank')}>
      <i class="fa-solid fa-arrow-up-right-from-square fa-xl" />
    </span>
  </div>
  <div
    slot="content"
    class="card-container px-4">
    <div class="columns">
      <div class="column is-half">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <div
          class="image pointor has-tooltip-right has-tooltip-arrow mb-4"
          data-tooltip="Open map"
          on:click={() => window.open(style.editor, '_blank')}
          bind:this={mapContainer}>
          {#if isLoading}
            <Loader size="medium" />
          {/if}
        </div>
      </div>

      <div class="column is-half">
        <div class="tile is-vertical align-center">
          <p class="title is-4 style-name pb-4">
            <i class={headerIcon} />
            {style.name}
          </p>
          <p class="p-0 m-0">
            <b>Created at: </b><Time
              timestamp={style.createdat}
              format="h:mm A · MMMM D, YYYY" />
          </p>
          {#if style.created_user}
            <p class="p-0 m-0">
              <b>Created by: </b>{style.created_user}
            </p>
          {/if}
          <p class="p-0 m-0">
            <b>Updated at: </b><Time
              timestamp={style.updatedat}
              format="h:mm A · MMMM D, YYYY" />
          </p>
          {#if style.updated_user}
            <p class="p-0 m-0">
              <b>Updated by: </b>{style.updated_user}
            </p>
          {/if}
        </div>
        <div class="tile is-parent py-4">
          <CtaLink
            label="Open map"
            on:clicked={() => window.open(style.editor, '_blank')}
            isArrow={false} />
        </div>
        {#if $page.data.session && style.created_user === $page.data.session.user.email}
          <div class="columns is-12 align-center">
            <div
              class="column is-12 has-tooltip-top has-tooltip-arrow"
              data-tooltip="Delete map">
              <Button
                title="Delete"
                isPrimary={false}
                on:clicked={() => (confirmDeleteDialogVisible = true)} />
            </div>
          </div>
        {/if}
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
    height: 300px;
    border: 1px solid gray;

    @media (max-width: 48em) {
      width: 100%;
      height: 150px;
    }

    :global(.loader) {
      position: absolute;
      top: calc(45%);
      left: calc(45%);

      @media (max-width: 48em) {
        top: calc(35%);
        left: calc(40%);
      }
    }
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

  .open-button {
    width: 30px;
    height: 30px;
    color: #d12800;
  }

  .style-name {
    // white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-transform: capitalize;
  }
</style>
