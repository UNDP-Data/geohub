import { describe, beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, fireEvent, within, type RenderResult } from '@testing-library/svelte'

import BucketCardFilter from '$components/BucketCardFilter.svelte'

beforeEach(cleanup)

describe('Bucket Card', () => {
  let sut: RenderResult
  let bucketCardFilter: HTMLElement

  beforeEach(() => {
    sut = render(BucketCardFilter)
    bucketCardFilter = sut.getByTestId('bucket-card-filter-container')
  })

  it('should render the container', () => {
    expect(bucketCardFilter).toBeDefined()
  })

  it('should set the filter selected property to true upon click', async () => {
    const bucketFilterButton = within(bucketCardFilter).getByLabelText('Filter Buckets')
    expect(bucketFilterButton).toBeDefined()

    const mockBucketFilterButtonEvent = vi.fn()
    let dispatchContent = []

    sut.component.$on('click', function (event) {
      mockBucketFilterButtonEvent(event.detail)
      dispatchContent = event.detail
    })

    await fireEvent.click(bucketFilterButton)
    expect(mockBucketFilterButtonEvent).toHaveBeenCalled()
    expect(mockBucketFilterButtonEvent).toHaveBeenCalledTimes(1)
    expect(mockBucketFilterButtonEvent).not.toHaveBeenCalledTimes(2)
    expect(dispatchContent).toEqual({ bucketCardFilterSelected: true })
  })
})
