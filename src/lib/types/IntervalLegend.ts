import type { ClassificationMethodTypes } from '$lib/constants'
import type { IntervalLegendColorMapRow } from './IntervalLegendColorMapRow'

export interface IntervalLegend {
  numberOfClasses?: number
  colorMapRows?: IntervalLegendColorMapRow[]
  propertyName?: string
  propertyOptions?: string[]
}
