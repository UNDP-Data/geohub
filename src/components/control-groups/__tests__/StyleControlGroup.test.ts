import '@testing-library/jest-dom'
import { render } from '@testing-library/svelte'
import type { RenderResult } from '@testing-library/svelte'

import component from '../StyleControlGroup.svelte'

describe('Vector : Style Control Group ', () => {
  let sut: RenderResult

  beforeEach(() => {
    sut = render(component, { title: 'Orange' })
  })

  it('should render', () => {
    const row = sut.getByTestId('box-title')
    expect(row).toBeDefined()
    expect(row).toHaveTextContent('Orange')
  })
})
