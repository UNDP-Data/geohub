import { describe, beforeEach, expect, it, vi } from 'vitest'
import {
  cleanup,
  render,
  fireEvent,
  waitFor,
  within,
  waitForElementToBeRemoved,
  type RenderResult,
} from '@testing-library/svelte'

import BucketCard from '$components/BucketCard.svelte'
import type { Bucket } from '$lib/types'
import { BucketType } from '$lib/constants'

const bucket: Bucket = {
  id: '1649951891000',
  published: true,
  path: 'climateaction/',
  label: 'Climate Action',
  description: 'Bucket contains data related to SDG 13',
  icon: 'fa-duotone fa-earth-americas',
  type: BucketType.INTERNAL,
  tags: ['Climate Change', 'Heat', 'Precipitation', 'Weather'],
}

beforeEach(cleanup)

describe('Bucket Card', () => {
  let sut: RenderResult
  let cardContainer: HTMLElement

  beforeEach(() => {
    sut = render(BucketCard, { bucket })
    cardContainer = sut.getByTestId('card-container')
  })

  it('should render the container', () => {
    expect(cardContainer).toBeDefined()
  })

  it('should display an icon', async () => {
    const mock = vi.fn()
    sut.component.$on('click', mock)
    fireEvent.click(cardContainer)
    expect(mock).toHaveBeenCalledOnce()

    // icon
    const label = sut.getByLabelText(bucket.label)
    expect(label).toBeDefined()
  })

  it('should display a tooltip with a label, description and tags upon click', async () => {
    // show tooltip
    fireEvent.mouseEnter(cardContainer)

    // label and description
    await waitFor(() => sut.getByTestId('tooltip'))
    const tooltip = sut.getByTestId('tooltip')
    expect(within(tooltip).getByText(bucket.label)).toBeDefined()
    expect(within(tooltip).getByText(bucket.description)).toBeDefined()

    // tags
    expect(within(tooltip).getByText('Climate Change')).toBeDefined()
    expect(within(tooltip).getByText('Heat')).toBeDefined()
    expect(within(tooltip).getByText('Precipitation')).toBeDefined()
    expect(within(tooltip).getByText('Weather')).toBeDefined()

    // hide tooltip
    await fireEvent.click(cardContainer)
    waitForElementToBeRemoved(tooltip, {
      timeout: 5000,
    }).then(() => expect(sut.queryByText(bucket.label)).toBeNull())
  })
})
