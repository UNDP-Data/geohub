import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, type RenderResult } from '@testing-library/svelte'

import NumberInput from '$components/controls/NumberInput.svelte'

beforeEach(cleanup)

describe('Number Input : Default Values', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(NumberInput, {
      value: 5
    })
    viewContainer = sut.getByTestId('number-input-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the number', () => {
    const numberOfClasses = sut.getByTitle('Number Label')
    expect(numberOfClasses).toBeDefined()
    expect(numberOfClasses).toHaveTextContent('5')
  })

  it('should decrease the number upon click of decrease button and fire a dispatch event', async () => {
    const mockNumberInputEvent = vi.fn()
    let dispatchContent = []

    sut.component.$on('change', function (event) {
      mockNumberInputEvent(event.detail)
      dispatchContent = event.detail
    })

    const decreaseClassesButton = sut.getByTitle('Decrease number')
    expect(decreaseClassesButton).toBeDefined()
    await fireEvent.click(decreaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('4')
    expect(mockNumberInputEvent).toHaveBeenCalled()
    expect(dispatchContent).toEqual({ value: 4 })
  })

  it('should increase the number upon click of increase button and fire a dispatch event', async () => {
    const mockNumberInputEvent = vi.fn()
    let dispatchContent = []

    sut.component.$on('change', function (event) {
      mockNumberInputEvent(event.detail)
      dispatchContent = event.detail
    })

    const increaseClassesButton = sut.getByTitle('Increase number')
    expect(increaseClassesButton).toBeDefined()
    await fireEvent.click(increaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('6')
    expect(mockNumberInputEvent).toHaveBeenCalled()
    expect(dispatchContent).toEqual({ value: 6 })
  })
})

describe('Number Input : Min/Max Values', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(NumberInput, {
      value: 3,
      minValue: 2,
      maxValue: 4,
    })
    viewContainer = sut.getByTestId('number-input-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the number', () => {
    const numberOfClasses = sut.getByTitle('Number Label')
    expect(numberOfClasses).toBeDefined()
    expect(numberOfClasses).toHaveTextContent('3')
  })

  it('should decrease the number upon click of decrease button to the minimum', async () => {
    const decreaseClassesButton = sut.getByTitle('Decrease number')
    expect(decreaseClassesButton).toBeDefined()
    await fireEvent.click(decreaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('2')
    await fireEvent.click(decreaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('2')

    expect(sut.getByTitle('Decrease number')).toHaveClass('minus disabled')
  })

  it('should increase the number of classes upon click of increase button to the maximum', async () => {
    const increaseClassesButton = sut.getByTitle('Increase number')
    expect(increaseClassesButton).toBeDefined()
    await fireEvent.click(increaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('4')
    await fireEvent.click(increaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('4')

    expect(sut.getByTitle('Increase number')).toHaveClass('plus disabled')
  })
})

describe('Number Input : Step Values', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(NumberInput, {
      value: 6,
      minValue: 0,
      maxValue: 10,
      step: 2,
    })
    viewContainer = sut.getByTestId('number-input-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should display the number', () => {
    const numberOfClasses = sut.getByTitle('Number Label')
    expect(numberOfClasses).toBeDefined()
    expect(numberOfClasses).toHaveTextContent('6')
  })

  it('should decrease the number upon click of decrease button to the minimum', async () => {
    const decreaseClassesButton = sut.getByTitle('Decrease number')
    expect(decreaseClassesButton).toBeDefined()
    await fireEvent.click(decreaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('4')
    await fireEvent.click(decreaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('2')
  })

  it('should increase the number of classes upon click of increase button to the maximum', async () => {
    const increaseClassesButton = sut.getByTitle('Increase number')
    expect(increaseClassesButton).toBeDefined()
    await fireEvent.click(increaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('8')
    await fireEvent.click(increaseClassesButton)
    expect(sut.getByTitle('Number Label')).toHaveTextContent('10')
  })
})

