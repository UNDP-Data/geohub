import { describe, beforeEach, expect, it } from 'vitest'
import { cleanup, render, fireEvent, within, type RenderResult } from '@testing-library/svelte'
import { get } from 'svelte/store'

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
    const treeContainer = sut.getByTestId('tree-container')
    expect(within(treeContainer).getByText('End Poverty')).toBeDefined()
  })

  it('should render five buckets / icons', () => {
    expect(within(viewContainer).getByLabelText('Climate Action')).toBeDefined()
    expect(within(viewContainer).getByLabelText('Electricity Access')).toBeDefined()
    expect(within(viewContainer).getByLabelText('End Poverty')).toBeDefined()
    expect(within(viewContainer).getByLabelText('Good Health And Well Being')).toBeDefined()
    expect(within(viewContainer).getByLabelText('Zero Hunger')).toBeDefined()
  })

  it('should add and remove a root node on click of a bucket icon', async () => {
    const bucketClimateActionButton = within(viewContainer).getByLabelText('Climate Action')
    const treeContainer = sut.getByTestId('tree-container')

    // add climate action
    await fireEvent.click(bucketClimateActionButton)
    expect(within(treeContainer).getByText('End Poverty')).toBeDefined()
    expect(within(treeContainer).getByText('Climate Action')).toBeDefined()
    let bucketClimateAction = get(bucketList).find((bucket) => bucket.label === 'Climate Action')
    expect(bucketClimateAction.selected).toBe(true)

    // remove climate action
    await fireEvent.click(bucketClimateActionButton)
    bucketClimateAction = get(bucketList).find((bucket) => bucket.label === 'Climate Action')
    expect(bucketClimateAction.selected).toBe(false)
    expect(within(treeContainer).queryByText('Climate Action')).toBeNull()
  })
})
