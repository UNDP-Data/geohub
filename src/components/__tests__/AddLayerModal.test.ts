import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, within, render, type RenderResult } from '@testing-library/svelte'
import { get } from 'svelte/store'

import AddLayerModal from '$components/controls/AddLayerModal.svelte'
import { modalVisible } from '$stores'
import treeNodeData from './_treeNode.json'

beforeEach(cleanup)

describe('Add Layer : Modal Not Visibile', () => {
  it('should render not render the container', () => {
    const sut = render(AddLayerModal)
    const viewContainer = sut.queryByTestId('add-layer-view-container')
    expect(viewContainer).toBeNull()
  })
})

describe('Add Layer : Modal Visible', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(AddLayerModal, {
      isModalVisible: true,
      treeNode: treeNodeData,
    })
    viewContainer = sut.getByTestId('add-layer-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the layer id', () => {
    const layerIdInput = sut.getByTestId('layer-id-input')
    expect(layerIdInput).toBeDefined()
    expect(within(layerIdInput).getByText('NGA_DepRationAdm2')).toBeDefined()
  })

  it('should display two radio button options', () => {
    let option = sut.getByTitle('Heatmap Option')
    expect(option).toBeDefined()

    option = sut.getByTitle('Point Option')
    expect(option).toBeDefined()
  })

  it('should hide the modal upon click of close', async () => {
    const viewContainer = sut.queryByTestId('add-layer-view-container')
    expect(viewContainer).not.toBeNull()

    const closeButton = sut.getByTitle('Close Layer Button')
    expect(closeButton).toBeDefined()
    await fireEvent.click(closeButton)

    expect(get(modalVisible)).toEqual(false)
  })
})
