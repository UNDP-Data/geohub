import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within, type RenderResult } from '@testing-library/svelte'

import IntervalsLegend from '$components/IntervalsLegend.svelte'

import layer from './_layer.json'

beforeEach(cleanup)

describe('Intervals Legend', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    sut = render(IntervalsLegend, {
      layerConfig: layer,
      numberOfClasses: 5,
      colorPickerVisibleIndex: -1,
    })
    viewContainer = sut.getByTestId('intervals-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the number of classes', () => {
    const numberOfClasses = sut.getByTitle('Number of Classes')
    expect(numberOfClasses).toBeDefined()
    expect(numberOfClasses).toHaveTextContent('5')
  })
})