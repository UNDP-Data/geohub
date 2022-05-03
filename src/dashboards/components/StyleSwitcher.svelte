<script lang="ts">
  import { onMount } from 'svelte'
  import { Map } from 'maplibre-gl'
  import { map } from '../stores'

  export let styles = []
  let maps = []
  let activeStyle
  $: activeStyle, setActive()

  onMount(() => {
    styles.forEach((style) => {
      const _map = new Map({
        container: style.title,
        style: style.uri,
        center: [36.975, -1.364],
        zoom: 1,
        attributionControl: false,
        interactive: false,
      })
      maps.push(_map)
    })
  })

  const setActive = () => {
    if (!activeStyle) return
    styles.forEach((s) => {
      s.active = s.title === activeStyle.title
    })
  }

  const changeStyle = (title) => {
    if (!$map) return
    styles.forEach((s) => {
      if (s.title === title) {
        activeStyle = JSON.parse(JSON.stringify(s))
      }
    })
    $map.setStyle(activeStyle.uri)
    setActive()
  }
</script>

<div class="style-swich-container">
  {#each styles as style}
    <div
      class="map-style-switcher"
      id={style.title}
      on:click={() => {
        changeStyle(style.title)
      }} />
  {/each}
</div>

<style lang="scss">
  .style-swich-container {
    position: absolute;
    bottom: 40px;
    left: 10px;
    display: inline-flex;
  }

  .map-style-switcher {
    cursor: pointer;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    margin: 5px;
    border-style: solid;
    border-color: #1c1c1c;
    border-width: 1px;
  }

  .map-style-switcher:hover {
    border-color: #e7aa70;
    border-width: 2px;
  }
</style>
