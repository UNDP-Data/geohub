<script lang="ts">
  import { onMount } from 'svelte'
  import { Map } from 'maplibre-gl'
  import Time from 'svelte-time'

  interface MapStyle {
    id: string
    name: string
    createdat: string
    style: string
    viewer: string
  }

  export let style: MapStyle
  let mapContainer: HTMLDivElement

  onMount(async () => {
    const res = await fetch(style.style)
    const styleJSON = await res.json()

    new Map({
      container: mapContainer,
      style: style.style,
      center: styleJSON.center ? styleJSON.center : [0, 0],
      zoom: styleJSON.zoom ? styleJSON.zoom : 4,
      attributionControl: false,
      interactive: false,
    })
  })
</script>

<a href={style.viewer} target="_blank">
  <div class="card">
    <div class="card-image">
      <div class="map" id="map" bind:this={mapContainer} />
    </div>
    <div class="card-content">
      <div class="media">
        <div class="media-content">
          <p class="title is-4">{style.name}</p>
        </div>
      </div>

      <div class="content">
        <Time timestamp={style.createdat} format="h:mm A · MMMM D, YYYY" />
      </div>
    </div>
  </div>
</a>

<style lang="scss">
  @import 'https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css';

  .card {
    margin: 5px;
    padding: 5px;
    width: 300px;
    cursor: pointer;
  }

  .map {
    width: 100%;
    height: 100%;
  }
</style>
