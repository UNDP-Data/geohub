import { describe, beforeEach, expect, it } from 'vitest'
import { cleanup, render, fireEvent, waitForElementToBeRemoved, within } from '@testing-library/svelte'
import type { RenderResult } from '@testing-library/svelte'
import RasterLegendContainer from '$components/RasterLegendContainer.svelte'
import { ClassificationMethodTypes, COLOR_CLASS_COUNT, DEFAULT_COLORMAP } from '$lib/constants'
import type { Layer } from '$lib/types'

const layer: Layer = {
  definition: {
    id: '',
    type: 'raster',
    source: '0',
  },
  info: {
    band_metadata: [
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore:next-line
      ['1', {}],
    ],
    stats: {
      1: {
        min: 100,
        max: 103,
        mean: 101.48582891160865,
        count: 15454,
        sum: 1568362,
        std: 1.1227380530818927,
        median: 101,
        majority: 100,
        minority: 101,
        unique: 4,
        histogram: [
          [4000, 0, 0, 3756, 0, 0, 3888, 0, 0, 3810],
          [100, 100.3, 100.6, 100.9, 101.2, 101.5, 101.8, 102.1, 102.4, 102.7, 103],
        ],
        valid_percent: 3.2,
        masked_pixels: 467874,
        valid_pixels: 15454,
        percentile_98: 103,
        percentile_2: 100,
      },
    },
  },
  colorMapName: DEFAULT_COLORMAP,
  continuous: {
    minimum: 0,
    maximum: 100,
  },
  intervals: {
    classification: ClassificationMethodTypes.EQUIDISTANT,
    numberOfClasses: COLOR_CLASS_COUNT,
    colorMapRows: [],
  },
  expression: '',
}

beforeEach(cleanup)

describe('Raster Legend Container', () => {
  let sut: RenderResult
  let viewContainer: HTMLElement

  beforeEach(() => {
    sut = render(RasterLegendContainer, { layer })
    viewContainer = sut.getByTestId('raster-legend-view-container')
  })

  it('should render the container', () => {
    expect(viewContainer).toBeDefined()
  })
})

// it('should render the default legend type: continuous', () => {
//   expect(within(viewContainer).getByTestId('continuous-view-container')).toBeDefined()
// })

// it('should toggle between continuous / intervals legend types upon click of toggle icon', async () => {
//   const toggleIcon = within(viewContainer).getByTestId('legend-toggle-container')
//   expect(toggleIcon).toBeDefined()

//   // show intervals legend type
//   await fireEvent.click(toggleIcon)
//   expect(within(viewContainer).getByTestId('intervals-view-container')).toBeDefined()

//   // show continuous legend type
//   await fireEvent.click(toggleIcon)
//   expect(within(viewContainer).getByTestId('continous-view-container')).toBeDefined()
// })

//   it('should show / hide the color picker upon click of the color map picker button', async () => {
//     const colorMapPickerButton = sut.getByTestId('colormap-toggle-container')
//     expect(colorMapPickerButton).toBeDefined()
//
//     // show color map picker
//     await fireEvent.click(colorMapPickerButton)
//     const colorMapPicker = sut.getByTestId('color-map-picker')
//     expect(colorMapPicker).toBeDefined()
//
//     // hide color map picker
//     await fireEvent.click(colorMapPickerButton)
//
//     waitForElementToBeRemoved(colorMapPicker, {
//       timeout: 1000,
//     }).then(() => expect(sut.queryByTestId('color-map-picker')).toBeNull())
//   })
// })
