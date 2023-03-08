import { describe, expect, it } from 'vitest'

import { getSampleFromInterval } from './getSampleFromInterval'
import { getIntervalList } from './getIntervalList'
import { ClassificationMethodTypes } from '../config/AppConfig'

describe('getIntervalList', () => {
  it('should return an interval list : natural breaks', () => {
    const randomSample = getSampleFromInterval(1, 120, 1000)
    const samplesList = getIntervalList(ClassificationMethodTypes.NATURAL_BREAK, 1, 1000, randomSample, 5)
    expect(samplesList).toHaveLength(6)
  })
  it('should return an interval list : equidistant', () => {
    const randomSample = getSampleFromInterval(1, 120, 1000)
    const samplesList = getIntervalList(ClassificationMethodTypes.EQUIDISTANT, 1, 1000, randomSample, 5)
    expect(samplesList).toEqual([1, 200.8, 400.6, 600.4, 800.2, 1000])
  })
  it('should return an interval list : quantile', () => {
    const randomSample = getSampleFromInterval(1, 120, 1000)
    const samplesList = getIntervalList(ClassificationMethodTypes.QUANTILE, 1, 1000, randomSample, 5)
    expect(samplesList).toHaveLength(6)
  })
  it('should return an interval list : logarithmic', () => {
    const randomSample = getSampleFromInterval(1, 120, 1000)
    const samplesList = getIntervalList(ClassificationMethodTypes.LOGARITHMIC, 1, 1000, randomSample, 5)
    expect(samplesList).toEqual([1, 3.98, 15.85, 63.1, 251.19, 1000])
  })
  it('should return an interval list : logarithmic', () => {
    const randomSample = getSampleFromInterval(-23, 120, 1000)
    const samplesList = getIntervalList(ClassificationMethodTypes.LOGARITHMIC, -23, 1000, randomSample, 8)
    expect(samplesList).toEqual([-23, -21.62, -18.34, -10.55, 8, 52.11, 157.02, 406.54, 1000])
  })
  it('should return an interval list : logarithmic', () => {
    const randomSample = getSampleFromInterval(0, 1, 1000)
    const samplesList = getIntervalList(ClassificationMethodTypes.LOGARITHMIC, 0, 1, randomSample, 5)
    expect(samplesList).toEqual([0, 0.15, 0.32, 0.52, 0.74, 1])
  })
})
