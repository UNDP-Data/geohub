import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, within, type RenderResult } from '@testing-library/svelte'

import UniqueValuesLegend from '$components/UniqueValuesLegend.svelte'

import layer from './_layer.json'

beforeEach(cleanup)

describe('Unique Values Legend', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(UniqueValuesLegend, {
      layerConfig: layer,
      colorPickerVisibleIndex: -1,
    })
    viewContainer = sut.getByTestId('unique-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display 3 classes', () => {
    const colorMapRows = sut.getAllByTestId('unique-legend-color-map-row-container')
    expect(colorMapRows).toBeDefined()
    expect(colorMapRows.length).toEqual(3)

    expect(within(colorMapRows[0]).getByTitle('Start Value')).toHaveValue('11')
    expect(within(colorMapRows[0]).getByTitle('End Value')).toHaveValue('Rice Village')

    expect(within(colorMapRows[1]).getByTitle('Start Value')).toHaveValue('23')
    expect(within(colorMapRows[1]).getByTitle('End Value')).toHaveValue('Sparse trees')

    expect(within(colorMapRows[2]).getByTitle('Start Value')).toHaveValue('63')
    expect(within(colorMapRows[2]).getByTitle('End Value')).toHaveValue('Remote croplands')
  })
})
