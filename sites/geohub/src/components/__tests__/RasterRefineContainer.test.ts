import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, type RenderResult } from '@testing-library/svelte'

import RasterRefineContainer from '$components/controls/RasterRefineContainer.svelte'
import * as helper from '$lib/helper'

import layer from './_layer.json'

beforeEach(cleanup)

describe('Refine Container', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(RasterRefineContainer, {
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

    const functionsButton = sut.getByTitle('sin')
    await fireEvent.click(functionsButton)

    const expressionInput = sut.getByTitle('Expression input')
    expect(expressionInput).toHaveValue('&=*7sin()')
  })

  it('should input an expression to the input field', async () => {
    let expressionInput = sut.getByTitle('Expression input')
    expect(expressionInput).toBeDefined()
    await fireEvent.input(expressionInput, { target: { value: 'where((b1==1)|(b1>0.9),1,0);' } })
    expressionInput = sut.getByTitle('Expression input')
    expect(expressionInput).toHaveValue('where((b1==1)|(b1>0.9),1,0);')
  })
  // this test is commented out because the Remove expression button semantics have changed
  it.skip('should remove an expression upon click of the remove expression button', async () => {
    const spy = vi.spyOn(helper, 'updateParamsInURL')
    let expressionInput = sut.getByTitle('Expression input')
    await fireEvent.input(expressionInput, { target: { value: 'where((b1==1)|(b1>0.9),1,0);' } })

    const clearButton = sut.getByTitle('Remove expression')
    await fireEvent.click(clearButton)

    expressionInput = sut.getByTitle('Expression input')
    expect(expressionInput).toHaveValue('')
    expect(spy).toBeCalledTimes(1)
  })

  it.skip('should update the map upon click of the apply button ', async () => {
    const spy = vi.spyOn(helper, 'updateParamsInURL')

    const logicalButton = sut.getByTitle('&')
    await fireEvent.click(logicalButton)

    const applyButton = sut.getByTitle('Apply expression')
    await fireEvent.click(applyButton)

    await expect(spy).resolves.toBeCalledTimes(0)
  })
})
