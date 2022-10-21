import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

export interface OperatorCategory {
  name: string
  title: string
  icon: IconDefinition
  operators: Array<string>
  isVisible: boolean
}
