import { describe, beforeEach, expect, it } from 'vitest'
import { cleanup, render, within, type RenderResult } from '@testing-library/svelte'

import BucketView from '$components/BucketView.svelte'
import { bucketList, treeBucket } from '$stores'

import bucketListData from './_bucketList.json'
import treeBucketsData from './_treeBuckets.json'

const buckets = []
bucketListData.forEach((item) => buckets.push(item))

bucketList.set(buckets)
treeBucket.set(treeBucketsData)

beforeEach(cleanup)

describe('Bucket View', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    sut = render(BucketView)
    viewContainer = sut.getByTestId('view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })

  it('should render a root node item  with a label', () => {
    expect(within(viewContainer).getByText('endpoverty')).toBeDefined()
  })

  it('should render five buckets / icons', () => {
    expect(within(viewContainer).getByLabelText('Climate Action')).toBeDefined()
    expect(within(viewContainer).getByLabelText('Electricity Access')).toBeDefined()
    expect(within(viewContainer).getByLabelText('End Poverty')).toBeDefined()
    expect(within(viewContainer).getByLabelText('Good Health And Well Being')).toBeDefined()
    expect(within(viewContainer).getByLabelText('Zero Hunger')).toBeDefined()
  })
})
