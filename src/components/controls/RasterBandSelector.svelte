<script lang="ts">
  import { cloneDeep } from 'lodash-es'
  import { v4 as uuidv4 } from 'uuid'
  import { getActiveBandIndex } from '$lib/helper'

  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { layerList, map } from '$stores'

  export let layer: Layer

  let info: RasterTileMetadata
  let bands: string[] = undefined
  let selected: string = undefined

  $: selected, setActiveBand()
  const setActiveBand = () => {
    if (layer.tree && layer.tree.isMosaicJSON) return
    if (!info) return
    if (info.active_band_no === selected) return

    const newLayer = cloneDeep(layer)
    const layerId = uuidv4()
    newLayer.definition.id = layerId

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    updateLayerInfo(newLayer.info, selected)

    const currentLayerIndex = $layerList.indexOf(layer)
    $layerList.splice(currentLayerIndex, 0, newLayer)

    // layerList.set([newLayer, ...$layerList])
    $map.addLayer(newLayer.definition, layer.definition.id)

    deleteOldLayer(layer.definition.id)
  }

  if (layer.definition.type === 'raster' && !layer.tree && layer.tree.isMosaicJSON) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ;({ info } = layer)
    selected = info.active_band_no
    if (info.band_metadata.length > 1) {
      bands = info.band_metadata.map((meta) => meta[0])
    }
  }

  const updateLayerInfo = (metadata: RasterTileMetadata, bandName: string) => {
    const layerSrc = $map.getSource(layer.definition.source)
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
    $layerList = $layerList.filter((item) => item.definition.id !== oldLayerId)
    $map.removeLayer(oldLayerId)
  }
</script>

{#if layer.definition.type === 'raster' && bands && bands.length > 0}
  <div class="select is-success is-rounded is-small">
    <select bind:value={selected}>
      {#each bands as band}
        <option value={band}>B{band}</option>
      {/each}
    </select>
  </div>
{/if}

<style lang="scss">
</style>
