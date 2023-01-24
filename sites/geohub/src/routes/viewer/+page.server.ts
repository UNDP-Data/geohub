import type { PageServerLoad } from './$types'
import type { StyleSpecification } from 'maplibre-gl'
import type { LegendState } from '$lib/types'

export const load: PageServerLoad = async (event) => {
  let data = {}
  const url = event.url
  const styleId = url.searchParams.get('style')
  if (styleId) {
    const res = await event.fetch(`/api/style/${styleId}`)
    if (res.ok) {
      const styleInfo = await res.json()
      data = { style: styleInfo }

      if (styleInfo.layers) {
        const legendState: LegendState = {}
        const style: StyleSpecification = styleInfo.style

        styleInfo.layers.map((el) => {
          const layerStyle = style.layers.find((l) => l.id === el.id)
          const cmap = layerStyle?.['colormap']
          const classification = layerStyle?.['classification']
          const lid = layerStyle?.['id']
          if (cmap && classification && lid) {
            //reuse state
            legendState[lid] = { classification: classification, colorMapName: cmap }
          }
        })
        styleInfo.legendState = legendState
      }
    }
  }
  return data
}
