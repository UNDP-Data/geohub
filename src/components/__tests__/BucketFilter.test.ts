import { describe, beforeEach, expect, it } from 'vitest'
import { cleanup, render, fireEvent, type RenderResult } from '@testing-library/svelte'

import BucketFilter from '$components/BucketFilter.svelte'
import { bucketList } from '$stores'

import bucketListData from './_bucketList.json'

const buckets = []
bucketListData.forEach((item) => buckets.push(item))
bucketList.set(buckets)

beforeEach(cleanup)

describe('Bucket Filter', () => {
  let sut: RenderResult
  let filterContainer: HTMLElement

  beforeEach(() => {
    sut = render(BucketFilter)
    filterContainer = sut.getByTestId('filter-container')
  })

  it('should render the container', () => {
    expect(filterContainer).toBeDefined()
  })

  it('should be able input a bucket name to filter', async () => {
    const input = sut.getByTestId('filter-bucket-input') as HTMLInputElement
    await fireEvent.input(input, { target: { value: 'Health' } })
    expect(input.value).toBe('Health')
  })

  it('should return two buckets upon filter of a string', async () => {
    const input = sut.getByTestId('filter-bucket-input') as HTMLInputElement
    await fireEvent.input(input, { target: { value: 'Health' } })
    expect(input.value).toBe('Health')

    // add delay for debounce
    await new Promise((r) => setTimeout(r, 750))
    const filterIndex = sut.component.$$.props.bucketsMeetThereshold
    expect(sut.component.$$.ctx[filterIndex]).toEqual(['climate-action/', 'good-health-and-wellbeing/'])
  })

  it('should return 4 buckets for filter of a case insensitive description', async () => {
    const input = sut.getByTestId('filter-bucket-input') as HTMLInputElement
    await fireEvent.input(input, { target: { value: 'sDg' } })
    expect(input.value).toBe('sDg')

    // add delay for debounce
    await new Promise((r) => setTimeout(r, 750))
    const filterIndex = sut.component.$$.props.bucketsMeetThereshold
    expect(sut.component.$$.ctx[filterIndex]).toEqual([
      'climate-action/',
      'end-poverty/',
      'good-health-and-wellbeing/',
      'zero-hunger/',
    ])
  })

  it('should have an empty input upon click of clear button', async () => {
    const input = sut.getByTestId('filter-bucket-input') as HTMLInputElement
    await fireEvent.input(input, { target: { value: 'Health' } })
    expect(input.value).toBe('Health')

    const clearButton = sut.getByTestId('filter-clear-button') as HTMLButtonElement
    await fireEvent.click(clearButton)
    expect(input.value).toBe('')
  })
})
