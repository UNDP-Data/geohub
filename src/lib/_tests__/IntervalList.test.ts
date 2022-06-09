import { describe, expect, it } from 'vitest'

import { ClassificationMethodTypes } from '$lib/constants'
import IntervalList from '../intervalList'

describe('IntervalList', () => {
  it('should return a random sample', () => {
    const bins = [100, 100.3, 100.6, 100.9, 101.2, 101.5, 101.8, 102.1, 102.4, 102.7, 103]
    const counts = [6023, 0, 0, 6301, 0, 0, 5665, 0, 0, 5642]
    const intervalList = new IntervalList(bins, counts, 1)
    const randomSample = intervalList.getRandomSample()

    expect(randomSample).toHaveLength(1000)
    expect(randomSample.filter(val => val === 102.85)).toHaveLength(1000)
  })

  it('should return an interval list', () => {
    const bins = [100, 100.3, 100.6, 100.9, 101.2, 101.5, 101.8, 102.1, 102.4, 102.7, 103]
    const counts = [6023, 0, 0, 6301, 0, 0, 5665, 0, 0, 5642]
    const intervalListHelper = new IntervalList(bins, counts, 1)
    const randomSample = intervalListHelper.getRandomSample()
    const intervalList = intervalListHelper.getIntervalList(
      ClassificationMethodTypes.EQUIDISTANT,
      100,
      103,
      randomSample,
      5,
    )

    expect(intervalList).toEqual([100, 100.6, 101.2, 101.8, 102.4, 103])
  })
})
