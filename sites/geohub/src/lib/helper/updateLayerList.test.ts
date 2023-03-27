import { describe, it, expect } from 'vitest'
import { updateLayerList } from '$lib/helper'

describe.todo('updateLayerList', () => {
  const testLayer = {
    id: 'testLayer',
    name: 'testLayer',
    type: 'raster',
  }

  const testLayerList = [
    { id: 'testLayer', name: 'testLayer', type: 'raster' },
    { id: 'testLayer2', name: 'testLayer2', type: 'raster' },
  ]
  it('should update the layer list with a new layer if the layer', async () => {
    await expect(updateLayerList(testLayer, testLayerList)).toEqual([
      {
        id: 'testLayer',
        name: 'testLayer',
        type: 'raster',
      },
      {
        id: 'testLayer2',
        name: 'testLayer2',
        type: 'raster',
      },
    ])
  })
})
