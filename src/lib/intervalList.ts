import chroma from 'chroma-js'
import { ClassificationMethodTypes } from '$lib/constants'
import { Jenks } from '$lib/jenks'
import { remapInputValue } from './helper'

export default class IntervalList {
  #bins: number[] = []
  #counts: number[] = []
  #midBins: number[] = []
  #randomSample: number[] = []
  #seed: number
  #sampleFromInterval: number[]

  constructor(bins: number[], counts: number[], seed: number = undefined) {
    this.#bins = bins
    this.#counts = counts
    this.#seed = seed
    this.#sampleFromInterval
    this.#setMidBins()
    this.#setRandomSample()
  }

  #setMidBins() {
    for (let i = 0; i < this.#bins.length - 1; i++) {
      this.#midBins[i] = (this.#bins[i] + this.#bins[i + 1]) * 0.5
    }
  }

  #setRandomSample() {
    const sum = this.#counts.reduce((a, b) => a + b, 0)
    const probList = this.#counts.map((item) => item / sum) // percentages of values. Need to calculate how many
    const randomSampleInts = []
    probList.map((probability, index) => {
      const numberOfItems = probability * 1000 // how many values exist within a cerain interval considering 1000 values
      const randomIntsList = this.getSampleFromInterval(
        this.#bins[index],
        this.#bins[index] + 1,
        Math.ceil(numberOfItems),
      )
      randomSampleInts.push(...randomIntsList)
    })
    this.#randomSample = [...new Set(randomSampleInts)]
  }

  #cumulativeSum(array: Array<number>) {
    return array.map(
      (
        (sum) => (value) =>
          (sum += value)
      )(0),
    )
  }

  #getBinarySearchValue(array: Array<number>, sValue: number, ARG_start = 0, ARG_len = 0) {
    // Range of [start, start+len): only start is inclusive. It works
    // similarly to "...".substr(start, len).indexOf(sValue)
    // `void 0` is shorthand for `undefined`
    const start = (ARG_start === void 0 ? 0 : ARG_start) | 0
    let len = (ARG_len === void 0 ? (array.length | 0) - start : ARG_len) | 0
    len = (len - 1) | 0

    if (len & 0x80000000) {
      const nCB = len & 0x80000000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x40000000) {
      const nCB = len & 0xc0000000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x20000000) {
      const nCB = len & 0xe0000000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x10000000) {
      const nCB = len & 0xf0000000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x8000000) {
      const nCB = len & 0xf8000000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x4000000) {
      const nCB = len & 0xfc000000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x2000000) {
      const nCB = len & 0xfe000000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x1000000) {
      const nCB = len & 0xff000000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x800000) {
      const nCB = len & 0xff800000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x400000) {
      const nCB = len & 0xffc00000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x200000) {
      const nCB = len & 0xffe00000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x100000) {
      const nCB = len & 0xfff00000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x80000) {
      const nCB = len & 0xfff80000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x40000) {
      const nCB = len & 0xfffc0000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x20000) {
      const nCB = len & 0xfffe0000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x10000) {
      const nCB = len & 0xffff0000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x8000) {
      const nCB = len & 0xffff8000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x4000) {
      const nCB = len & 0xffffc000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x2000) {
      const nCB = len & 0xffffe000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x1000) {
      const nCB = len & 0xfffff000
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x800) {
      const nCB = len & 0xfffff800
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x400) {
      const nCB = len & 0xfffffc00
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x200) {
      const nCB = len & 0xfffffe00
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x100) {
      const nCB = len & 0xffffff00
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x80) {
      const nCB = len & 0xffffff80
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x40) {
      const nCB = len & 0xffffffc0
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x20) {
      const nCB = len & 0xffffffe0
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x10) {
      const nCB = len & 0xfffffff0
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x8) {
      const nCB = len & 0xfffffff8
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x4) {
      const nCB = len & 0xfffffffc
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x2) {
      const nCB = len & 0xfffffffe
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (len & 0x1) {
      const nCB = len & 0xffffffff
      len ^= (len ^ (nCB - 1)) & (((Number(array[(start + nCB) | 0] <= sValue) | 0) - 1) >>> 0)
    }
    if (array[(start + len) | 0] !== sValue) {
      // remove this if-statement to return the next closest
      // element going downwards from the searched-for value
      // OR 0 if the value is less than all values in the
      // array. https://stackoverflow.com/a/44981570/5601591
      return -((-1 - start - len) | 0)
    }

    return (start + len) | 0
  }

  getRandomSample() {
    return this.#randomSample
  }

  getSampleFromInterval(intervalStart: number, intervalEnd: number, numberOfItems: number) {
    const randomSamplesFromInterval = []

    // Number of items per interval
    while (randomSamplesFromInterval.length < numberOfItems) {
      const randomInt = Math.floor(Math.random() * (intervalEnd - intervalStart + 1)) + intervalStart
      randomSamplesFromInterval.push(randomInt)
    }
    return randomSamplesFromInterval
  }
  getIntervalList(
    classificationMethod: ClassificationMethodTypes,
    layerMin: number,
    layerMax: number,
    randomSample: number[],
    numberOfClasses: number,
  ) {
    let intervalList: number[]

    if (classificationMethod === ClassificationMethodTypes.NATURAL_BREAK) {
      intervalList = new Jenks([layerMin, ...randomSample, layerMax], numberOfClasses).naturalBreak().map((element) => {
        return Number(element.toFixed(2))
      })
    } else if ((classificationMethod === ClassificationMethodTypes.LOGARITHMIC && layerMin < 1) || layerMax < 1) {
      const range = layerMax - layerMin
      const positive = [layerMin, ...randomSample, layerMax].map((v) => {
        return remapInputValue(v, layerMin, layerMax, 1, 1 + range)
      })
      intervalList = chroma
        .limits(positive, classificationMethod, numberOfClasses)
        .map((v) => {
          return remapInputValue(v, 1, 1 + range, layerMin, layerMax)
        })
        .map((element) => {
          return Number(element.toFixed(2))
        })
    } else {
      intervalList = chroma
        .limits([layerMin, ...randomSample, layerMax], classificationMethod, numberOfClasses)
        .map((element) => {
          return Number(element.toFixed(2))
        })
    }

    return intervalList
  }
}
