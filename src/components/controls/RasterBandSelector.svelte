<script lang="ts">
  import { getActiveBandIndex, updateParamsInURL } from '$lib/helper'

  import type { Layer, RasterTileMetadata } from '$lib/types'
  import { layerList, map } from '$stores'

  export let layer: Layer

  let info: RasterTileMetadata
  let bands: string[] = undefined
  let selected: string = undefined

  $: selected, setActiveBand()
  const setActiveBand = () => {
    if (!info) return
    info.active_band_no = selected
    layer = { ...layer, info: info }
    const layers = $layerList.filter((l) => layer.definition.id !== l.definition.id)
    layerList.set([layer, ...layers])

    updateLayerSource()
  }

  if (layer.definition.type === 'raster') {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ;({ info } = layer)
    selected = info.active_band_no
    if (info.band_metadata.length > 1) {
      bands = info.band_metadata.map((meta) => meta[0])
    }
  }

  const updateLayerSource = () => {
    const layerSrc = $map.getSource(layer.definition.source)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const layerURL = new URL(layerSrc.tiles[0])
    if (layerURL.searchParams.has('bidx')) {
      let params = {}
      layerURL.searchParams.delete('bidx')

      params = Object.assign(params, { bidx: getActiveBandIndex(info) + 1 })
      Object.keys(params).forEach((key) => {
        layerURL.searchParams.set(key, params[key])
      })
      updateParamsInURL(layer.definition, layerURL, params)
    }
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
