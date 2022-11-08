import type { IntervalLegendColorMapRow } from '../types'
import { ClassificationMethodTypes, NO_RANDOM_SAMPLING_POINTS } from '../constants'
import chroma from 'chroma-js'
import { getSampleFromInterval } from './getSampleFromInterval'
import { getIntervalList } from './getIntervalList'

export const generateColorMap = (
  layerMin: number,
  layerMax: number,
  colorMapRows: IntervalLegendColorMapRow[],
  numberOfClasses: number,
  classificationMethod: ClassificationMethodTypes,
  isClassificationMethodEdited: boolean,
  percentile98: number,
  colorMapName: string,
) => {
  const colorMap = []
  if (classificationMethod === ClassificationMethodTypes.LOGARITHMIC) {
    const randomSample = getSampleFromInterval(layerMin, percentile98, NO_RANDOM_SAMPLING_POINTS)
    const intervalList = getIntervalList(classificationMethod, layerMin, percentile98, randomSample, numberOfClasses)
    const scaleColorList = chroma.scale(colorMapName).classes(intervalList)
    for (let i = 0; i <= numberOfClasses - 2; i++) {
      const row: IntervalLegendColorMapRow = {
        index: i,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        color: [...scaleColorList(intervalList[i]).rgb(), 255],
        start:
          isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.start
            ? colorMapRows[i].start
            : intervalList[i],
        end:
          isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.end
            ? colorMapRows[i].end
            : intervalList[i + 1],
      }
      colorMap.push(row)
    }
    const lastRow: IntervalLegendColorMapRow = {
      index: numberOfClasses - 1,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      color: [...scaleColorList(intervalList[numberOfClasses - 1]).rgb(), 255],
      start: Math.floor(percentile98),
      end: Math.ceil(layerMax),
    }
    colorMap.push(lastRow)
    const replaceIndex = colorMap[colorMap.length - 2]

    replaceIndex['end'] = Math.floor(percentile98)
    colorMap.splice(colorMap.length - 2, replaceIndex)
  } else {
    const randomSample = getSampleFromInterval(layerMin, layerMax, NO_RANDOM_SAMPLING_POINTS)
    const intervalList = getIntervalList(classificationMethod, layerMin, layerMax, randomSample, numberOfClasses)
    const scaleColorList = chroma.scale(colorMapName).classes(intervalList)
    for (let i = 0; i <= numberOfClasses - 1; i++) {
      const row: IntervalLegendColorMapRow = {
        index: i,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore:next-line
        color: [...scaleColorList(intervalList[i]).rgb(), 255],
        start:
          isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.start
            ? colorMapRows[i].start
            : intervalList[i],
        end:
          isClassificationMethodEdited == false && colorMapRows.length > 0 && colorMapRows[i]?.end
            ? colorMapRows[i].end
            : intervalList[i + 1],
      }
      colorMap.push(row)
    }
  }
  return colorMap
}
