<script lang="ts">
  import { cloneDeep } from 'lodash-es'
  import { v4 as uuidv4 } from 'uuid'
  import { getActiveBandIndex, getLayerStyle } from '$lib/helper'

  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { layerList, map } from '$stores'

  export let layer: Layer

  let info: RasterTileMetadata
  let bands: string[] = undefined
  let selected: string = undefined

  let layerStyle = getLayerStyle($map, layer.id)

  $: selected, setActiveBand()
  const setActiveBand = () => {
    info = layer.info as RasterTileMetadata
    if (!info) return
    if (info?.isMosaicJson) return
    if (info.active_band_no === selected) return

    const newLayer = cloneDeep(layer)
    const layerId = uuidv4()
    newLayer.id = layerId

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    updateLayerInfo(newLayer.info, selected)

    const currentLayerIndex = $layerList.indexOf(layer)
    $layerList.splice(currentLayerIndex, 0, newLayer)

    const style = getLayerStyle($map, layer.id)

    // layerList.set([newLayer, ...$layerList])
    $map.addLayer(JSON.parse(JSON.stringify(style)), layer.id)

    deleteOldLayer(layer.id)
  }

  if (layerStyle.type === 'raster') {
    ;({ info } = layer)
    selected = info.active_band_no
    if (info.band_metadata.length > 0) {
      bands = info.band_metadata.map((meta) => meta[0]) as string[]
    }
  }

  const updateLayerInfo = (metadata: RasterTileMetadata, bandName: string) => {
    const layerSrc = $map.getSource(layerStyle.source)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!(layerSrc.tiles && layerSrc.tiles.length > 0)) return
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const layerURL = new URL(layerSrc.tiles[0])
    if (layerURL.searchParams.has('bidx')) {
      let params = {}
      layerURL.searchParams.delete('bidx')

      metadata.active_band_no = bandName
      const bandIndex = getActiveBandIndex(metadata)

      params = Object.assign(params, { bidx: bandIndex + 1 })

      const layerBandMetadataMin = metadata.band_metadata[bandIndex][1]['STATISTICS_MINIMUM']
      const layerBandMetadataMax = metadata.band_metadata[bandIndex][1]['STATISTICS_MAXIMUM']
      params = Object.assign(params, { rescale: `${layerBandMetadataMin},${layerBandMetadataMax}` })

      Object.keys(params).forEach((key) => {
        layerURL.searchParams.set(key, params[key])
      })
    }
  }

  const deleteOldLayer = (oldLayerId) => {
    $layerList = $layerList.filter((item) => item.id !== oldLayerId)
    $map.removeLayer(oldLayerId)
  }
</script>

{#if layerStyle && layerStyle.type === 'raster' && !info.isMosaicJson}
  {#if bands.length === 1}
    <span class="tag is-success">B{selected}</span>
  {:else if bands.length > 1}
    <div
      class="select is-success is-small has-tooltip-bottom has-tooltip-arrow"
      data-tooltip="Change raster band">
      <select bind:value={selected}>
        {#each bands as band}
          <option value={band}>B{band}</option>
        {/each}
      </select>
    </div>
  {/if}
{/if}

<style lang="scss">
  .select {
    padding-right: 0.5rem !important;
  }
</style>
