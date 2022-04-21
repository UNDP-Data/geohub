import { beforeEach, expect, it, vi } from 'vitest'
import { cleanup, render, fireEvent, waitFor, within, waitForElementToBeRemoved } from '@testing-library/svelte'

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

it('shows proper heading when rendered', async () => {
  vi.useRealTimers()
  const { queryByText, getByTestId, getByLabelText, component } = render(BucketCard, { bucket })

  // container
  const cardContainer = getByTestId('card-container')
  expect(cardContainer).toBeDefined()
  const mock = vi.fn()
  component.$on('click', mock)
  fireEvent.click(cardContainer)
  expect(mock).toHaveBeenCalledOnce()

  // icon
  const label = getByLabelText(bucket.label)
  expect(label).toBeDefined()

  // show tooltip
  fireEvent.mouseEnter(cardContainer)

  // label and description
  await waitFor(() => getByTestId('tooltip'))
  const tooltip = getByTestId('tooltip')
  expect(within(tooltip).getByText(bucket.label)).toBeDefined()
  expect(within(tooltip).getByText(bucket.description)).toBeDefined()

  // tags
  expect(within(tooltip).getByText('Climate Change')).toBeDefined()
  expect(within(tooltip).getByText('Heat')).toBeDefined()
  expect(within(tooltip).getByText('Precipitation')).toBeDefined()
  expect(within(tooltip).getByText('Weather')).toBeDefined()

  // hide tooltip
  await fireEvent.click(cardContainer)
  waitForElementToBeRemoved(tooltip).then(() => expect(queryByText(bucket.label)).toBeNull())
})
