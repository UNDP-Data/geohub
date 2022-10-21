import type { ClassificationMethodTypes } from '$lib/constants'
import type { IntervalLegendColorMapRow } from './IntervalLegendColorMapRow'

export interface IntervalLegend {
  classification?: ClassificationMethodTypes
  numberOfClasses?: number
  colorMapRows?: IntervalLegendColorMapRow[]
  propertyName?: string
  applyToOption?: string
  propertyOptions?: string[]
}
