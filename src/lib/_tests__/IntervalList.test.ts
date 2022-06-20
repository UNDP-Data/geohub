import { describe, expect, it } from 'vitest'

import { ClassificationMethodTypes } from '$lib/constants'
import IntervalList from '../intervalList'

describe('IntervalList', () => {
  it('should return a random sample', () => {
    const bins = [100, 100.3, 100.6, 100.9, 101.2, 101.5, 101.8, 102.1, 102.4, 102.7, 103]
    const counts = [6023, 0, 0, 6301, 0, 0, 5665, 0, 0, 5642]
    const intervalList = new IntervalList(bins, counts, 1)
    const randomSample = intervalList.getRandomSample()

    // expect(randomSample).toHaveLength(1000)
    // expect(randomSample.filter((val) => val === 102.85)).toHaveLength(1000)
  })

  it('should return an interval list : natural breaks', () => {
    const bins = [13, 2458, 4903, 7348, 9793, 12238]
    const counts = [641, 97, 26, 6, 5]
    const intervalListHelper = new IntervalList(bins, counts)
    const randomSample = intervalListHelper.getRandomSample()
    const intervalList = intervalListHelper.getIntervalList(
      ClassificationMethodTypes.NATURAL_BREAK,
      13,
      12238,
      randomSample,
      5,
    )

    expect(intervalList).toEqual([13, 14, 2459, 4904, 7349, 12238])
  })

  it('should return an interval list : equidistant', () => {
    const bins = [100, 100.3, 100.6, 100.9, 101.2, 101.5, 101.8, 102.1, 102.4, 102.7, 103]
    const counts = [6023, 0, 0, 6301, 0, 0, 5665, 0, 0, 5642]
    const intervalListHelper = new IntervalList(bins, counts)
    const randomSample = intervalListHelper.getRandomSample()
    const intervalList = intervalListHelper.getIntervalList(
      ClassificationMethodTypes.EQUIDISTANT,
      100,
      103,
      randomSample,
      3,
    )

    expect(intervalList).toEqual([100, 101.23, 102.47, 103.7])
  })

  it('should return an interval list : logarithmic', () => {
    const bins = [58, 100.3, 100.6, 100.9, 101.2, 101.5, 101.8, 102.1, 102.4, 102.7, 203]
    const counts = [6023, 0, 0, 6301, 0, 0, 5665, 0, 0, 5642]
    const intervalListHelper = new IntervalList(bins, counts)
    const randomSample = intervalListHelper.getRandomSample()
    const intervalList = intervalListHelper.getIntervalList(
      ClassificationMethodTypes.LOGARITHMIC,
      58,
      203,
      randomSample,
      10,
    )

    expect(intervalList).toEqual([58, 65.74, 74.51, 84.46, 95.73, 108.51, 122.99, 139.4, 158.01, 179.1, 203])
  })

  it('should return an interval list : quantile', () => {
    const bins = [20, 100.3, 100.6, 100.9, 101.2, 101.5, 101.8, 102.1, 102.4, 102.7, 134]
    const counts = [6023, 0, 0, 6301, 0, 0, 5665, 0, 0, 5642]
    const intervalListHelper = new IntervalList(bins, counts, 1)
    const randomSample = intervalListHelper.getRandomSample()
    const intervalList = intervalListHelper.getIntervalList(
      ClassificationMethodTypes.QUANTILE,
      20,
      134,
      randomSample,
      8,
    )

    expect(intervalList).toEqual([20, 20.13, 40.98, 101.24, 101.85, 102.4, 102.77, 103.59, 134])
  })
})
