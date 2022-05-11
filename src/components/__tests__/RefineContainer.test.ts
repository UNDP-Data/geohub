import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, within, type RenderResult } from '@testing-library/svelte'

import RefineContainer from '$components/RefineContainer.svelte'
import * as helper from '$lib/helper'

import layer from './_layer.json'

beforeEach(cleanup)

describe('Refine Container', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(RefineContainer, {
      layer: layer,
    })
    viewContainer = sut.getByTestId('refine-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should enter an expression by clicking on the operator buttons', async () => {
    const logicalButton = sut.getByTitle('&')
    await fireEvent.click(logicalButton)

    const comparisonButton = sut.getByTitle('=')
    await fireEvent.click(comparisonButton)

    const arithmeticButton = sut.getByTitle('*')
    await fireEvent.click(arithmeticButton)

    const numbersButton = sut.getByTitle('7')
    await fireEvent.click(numbersButton)

    const expressionInput = sut.getByTitle('Expression input')
    expect(expressionInput).toHaveValue('&=*7')
  })

  it('should input an expression to the input field', async () => {
    let expressionInput = sut.getByTitle('Expression input')
    expect(expressionInput).toBeDefined()
    await fireEvent.input(expressionInput, { target: { value: 'where((b1==1)|(b1%3E0.9),1,0);' } })
    expressionInput = sut.getByTitle('Expression input')
    expect(expressionInput).toHaveValue('where((b1==1)|(b1%3E0.9),1,0);')
  })

  it('should clear an expression upon click of the clear button', async () => {
    const spy = vi.spyOn(helper, 'updateParamsInURL')
    let expressionInput = sut.getByTitle('Expression input')
    await fireEvent.input(expressionInput, { target: { value: 'where((b1==1)|(b1%3E0.9),1,0);' } })

    const clearButton = sut.getByTitle('Clear expression button')
    await fireEvent.click(clearButton)

    expressionInput = sut.getByTitle('Expression input')
    expect(expressionInput).toHaveValue('')
    expect(spy).toBeCalledTimes(1)
  })

  it('should update the map upon click of the apply button ', async () => {
    const spy = vi.spyOn(helper, 'updateParamsInURL')

    const logicalButton = sut.getByTitle('&')
    await fireEvent.click(logicalButton)

    const applyButton = sut.getByTitle('Apply expression button')
    await fireEvent.click(applyButton)

    expect(spy).toBeCalledTimes(1)
  })
})
