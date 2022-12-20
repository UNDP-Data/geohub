import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, within, fireEvent, type RenderResult } from '@testing-library/svelte'

import IconImagePicker from '$components/controls/vector-styles/IconImagePicker.svelte'
import { spriteImageList } from '$stores'

import spriteListData from './_spriteList.json'
spriteImageList.set(spriteListData)

beforeEach(cleanup)

describe('Icon Image Picker : Card Style', () => {
  let sut: RenderResult
  let container: HTMLElement

  beforeEach(() => {
    sut = render(IconImagePicker, {
      iconImageAlt: 'circle',
    })
    container = sut.getByTestId('icon-image-picker-container')
  })

  it('should render the container', () => {
    expect(container).toBeDefined()
  })

  it('should render 3 tabs', async () => {
    const tabs = sut.getAllByTestId('group-letter-tab')
    expect(tabs.length).toEqual(3)
  })

  it('should render the default tab of "A - H"', async () => {
    const tabs = sut.getAllByTestId('group-letter-tab')
    const defaultTab = tabs[0]
    expect(defaultTab).toHaveClass('is-active')
  })

  it('should render the default tab of "A - H" with one icon', async () => {
    const iconPickerCards = sut.getAllByTitle('Icon Picker Card')
    expect(iconPickerCards.length).toEqual(1)
  })

  it('should dispatch an event upon click of close', async () => {
    const closeButton = sut.getByTitle('Close Icon Picker')
    expect(closeButton).toBeDefined()

    const mockCloseButtonEvent = vi.fn()
    let dispatchContent = []

    sut.component.$on('handleClosePopup', function (event) {
      mockCloseButtonEvent(event.detail)
      dispatchContent = event.detail
    })

    await fireEvent.click(closeButton)
    expect(mockCloseButtonEvent).toHaveBeenCalledTimes(1)
    expect(mockCloseButtonEvent).not.toHaveBeenCalledTimes(2)
    expect(dispatchContent).toEqual(null)
  })

  it('should render the tab of "I - Q" upon click, display two icons, and call dispatch upon click of icon', async () => {
    // click link
    let tabs = sut.getAllByTestId('group-letter-tab')
    const link = within(tabs[1]).getByText('I - Q')
    await fireEvent.click(link)

    tabs = sut.getAllByTestId('group-letter-tab')
    expect(tabs[0]).not.toHaveClass('is-active')
    expect(tabs[1]).toHaveClass('is-active')
    const iconPickerCards = sut.getAllByTitle('Icon Picker Card')
    expect(iconPickerCards.length).toEqual(2)

    // click icon
    const mockIconButtonEvent = vi.fn()
    let dispatchContent = []

    sut.component.$on('handleIconClick', function (event) {
      mockIconButtonEvent(event.detail)
      dispatchContent = event.detail
    })

    await fireEvent.click(iconPickerCards[0])
    expect(mockIconButtonEvent).toHaveBeenCalledTimes(1)
    expect(mockIconButtonEvent).not.toHaveBeenCalledTimes(2)
    expect(dispatchContent).toEqual({ spriteImageAlt: 'library' })
  })
})
