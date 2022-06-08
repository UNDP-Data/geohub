import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within, type RenderResult } from '@testing-library/svelte'

import VectorLineContainer from '$components/controls/VectorLineContainer.svelte'

import layer from './_layer.json'

beforeEach(cleanup)

describe('Vector Symbol Container', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(VectorLineContainer, { layer })
    viewContainer = sut.getByTestId('line-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the line color', () => {
    const lineColor = sut.getByTitle('rgba(53, 175, 109, 1)')
    expect(lineColor).toBeDefined()
    expect(lineColor).toHaveStyle('background: rgba(53, 175, 109, 1);')
  })
})
