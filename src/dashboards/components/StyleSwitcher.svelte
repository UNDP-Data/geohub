<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'
  import Tooltip, { Wrapper } from '@smui/tooltip'
  import { Map } from 'maplibre-gl'
  import { map } from '../stores'
  import type { StyleDefinition } from '$lib/types'

  const dispatch = createEventDispatcher()

  export let stylePrimary: StyleDefinition
  export let styleSecondary: StyleDefinition
  let activeStyle: StyleDefinition
  let buttonStyle: StyleDefinition
  let mainContainerId = 'main-switch-container'
  let mapToggle: Map

  const createMap = (id, uri) => {
    return new Map({
      container: id,
      style: uri,
      center: [36.975, -1.364],
      zoom: 1,
      attributionControl: false,
      interactive: false,
    })
  }

  onMount(() => {
    activeStyle = JSON.parse(JSON.stringify(stylePrimary))
    buttonStyle = JSON.parse(JSON.stringify(styleSecondary))
    mapToggle = createMap(mainContainerId, buttonStyle.uri)
  })

  const changeStyle = () => {
    if (!$map) return

    if (!activeStyle) {
      activeStyle = JSON.parse(JSON.stringify(stylePrimary))
    }
    if (!buttonStyle) {
      buttonStyle = JSON.parse(JSON.stringify(styleSecondary))
    }

    if (activeStyle.title === stylePrimary.title) {
      activeStyle = JSON.parse(JSON.stringify(styleSecondary))
      buttonStyle = JSON.parse(JSON.stringify(stylePrimary))
    } else {
      activeStyle = JSON.parse(JSON.stringify(stylePrimary))
      buttonStyle = JSON.parse(JSON.stringify(styleSecondary))
    }

    $map.setStyle(activeStyle.uri)
    if (!mapToggle) {
      createMap(mainContainerId, buttonStyle.uri)
    } else {
      mapToggle.setStyle(buttonStyle.uri)
    }
    mapToggle.on('styledata', () => {
      dispatch('styleChanged', {
        style: activeStyle,
      })
    })
  }
</script>

<div class="main-switch-container">
  <Wrapper>
    <div
      class="map-button"
      id={mainContainerId}
      on:click={() => {
        changeStyle()
      }} />
    {#if buttonStyle}
      <Tooltip yPos="above">{buttonStyle.title}</Tooltip>
    {/if}
  </Wrapper>
</div>

<style lang="scss">
  .main-switch-container {
    position: absolute;
    bottom: 40px;
    left: 10px;
  }

  .map-button {
    cursor: pointer;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    margin: 0px;
    border-style: solid;
    border-color: #1c1c1c;
    border-width: 1px;
  }
</style>
