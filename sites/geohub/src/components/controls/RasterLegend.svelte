<script lang="ts">
  import { slide } from 'svelte/transition'
  import RasterDefaultLegend from '$components/controls/RasterDefaultLegend.svelte'
  import RasterClassifyLegend from '$components/controls/RasterClassifyLegend.svelte'
  import type { BandMetadata, Layer, RasterLayerStats, RasterTileMetadata } from '$lib/types'
  import LegendTypeSwitcher from './LegendTypeSwitcher.svelte'
  import { layerList, map } from '$stores'
  import { fetchUrl, getActiveBandIndex, getLayerSourceUrl, getValueFromRasterTileUrl, loadMap } from '$lib/helper'
  import { Loader } from '@undp-data/svelte-undp-design'
  import RasterPropertyEditor from './RasterPropertyEditor.svelte'
  import { LegendTypes } from '$lib/config/AppConfig'
  import { page } from '$app/stores'

  const titilerUrl = $page.data.titilerUrl

  export let layer: Layer
  export let numberOfClasses: number

  /**
   * This component will only decide which legend to show based on the legendType
   * Initially, the legendType is decided based on if the layer is unique or not
   * if the layer is unique, the legendType is set to CLASSIFY
   * if the layer is not unique, the legendType is set to DEFAULT
   */

  let info: RasterTileMetadata
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
  ;({ info } = layer)

  const bandIndex = getActiveBandIndex(info)
  const bandMetaStats = info['band_metadata'][bandIndex][1] as BandMetadata
  let layerHasUniqueValues = Object.keys(bandMetaStats['STATISTICS_UNIQUE_VALUES']).length > 0
  export let legendType: LegendTypes
  let layerStats: RasterLayerStats

  const setStatsToInfo = async () => {
    // Add "stats" object to the "info" object
    if (!$map.loaded()) {
      console.log('LOADING MAP')
      await loadMap($map)
    }
    if (!info.isMosaicJson) {
      const layerURL = new URL(getLayerSourceUrl($map, layer.id))
      const statsURL = `${titilerUrl}/statistics?url=${layerURL.searchParams.get('url')}&histogram_bins=50`
      layerStats = await fetchUrl(statsURL)
      if (layerHasUniqueValues) {
        const statsURL = `${titilerUrl}/statistics?url=${layerURL.searchParams.get('url')}&categorical=true`
        layerStats = await fetchUrl(statsURL)
      }
      if (!('stats' in info)) {
        info = { ...info, stats: layerStats }
        layer = { ...layer, info: info }
        const layers = $layerList.map((lyr) => {
          return layer.id !== lyr.id ? lyr : layer
        })
        layerList.set([...layers])
      }
    }
  }

  const decideLegendType = () => {
    const colormap = getValueFromRasterTileUrl($map, layer.id, 'colormap') as number[][][]
    // maintains the state of the legendType
    if (!legendType) {
      if (colormap || layerHasUniqueValues) {
        legendType = LegendTypes.CLASSIFY
      } else {
        legendType = LegendTypes.DEFAULT
      }
      return legendType
    }
  }

  const initializeLegend = async () => {
    await loadMap($map)
    if (!('stats' in layer.info)) await setStatsToInfo()
    if (!legendType) decideLegendType()
    return legendType
  }
</script>

<div class="legend-container">
  {#await initializeLegend()}
    <div class="loader-container p-3">
      <Loader size="small" />
    </div>
  {:then rasterLegendInitialized}
    <LegendTypeSwitcher bind:legendType />
    <div class="editor-button"><RasterPropertyEditor bind:layerId={layer.id} /></div>
    {#if legendType === LegendTypes.DEFAULT}
      <div transition:slide>
        <RasterDefaultLegend bind:layerConfig={layer} />
      </div>
    {:else if legendType === LegendTypes.CLASSIFY}
      <div transition:slide>
        <RasterClassifyLegend
          bind:layer
          bind:numberOfClasses
          bind:layerHasUniqueValues />
      </div>
    {/if}
  {/await}
</div>

<style lang="scss">
  .loader-container {
    display: flex;
    align-items: center;
    width: fit-content;
    margin: 0 auto;
  }

  .legend-container {
    position: relative;

    .editor-button {
      position: absolute;
      top: 0em;
      right: 0em;
    }
  }
</style>
