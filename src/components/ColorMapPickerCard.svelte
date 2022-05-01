<script lang="ts">
  import { onMount } from 'svelte'
  import chroma from 'chroma-js'

  import { ColorMapTypes } from '$lib/constants'

  export let colorMapName: string
  export let colorMapType: ColorMapTypes
  export let layerMin: number
  export let layerMax: number
  export let numberOfColors: number

  let colorMap = []
  onMount(() => {
    if (colorMapType === ColorMapTypes.SEQUENTIAL) {
      colorMap = chroma
        .scale(colorMapName)
        .mode('lrgb')
        .padding([0.25, 0])
        .domain([layerMin, layerMax])
        .colors(numberOfColors, 'rgba')
    } else {
      colorMap = chroma.scale(colorMapName).mode('lrgb').domain([layerMin, layerMax]).colors(numberOfColors, 'rgba')
    }
  })
</script>

<div class="card">
  <div class="card-content">
    <div class="media">
      <figure
        class="image is-16by9"
        style="height: calc(9px * 4); width: calc(16px * 4);  background: linear-gradient(90deg, {colorMap});" />
    </div>
    <div class="content is-size-7">
      {colorMapName}
    </div>
  </div>
</div>

<style lang="scss">
  .card-content {
    padding: 5px;

    .media {
      margin: 0;
    }
  }
</style>
