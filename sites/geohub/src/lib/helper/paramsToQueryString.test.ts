import { describe, it, expect } from 'vitest'
import { paramsToQueryString } from '$lib/helper'

describe('paramsToQueryString', () => {
  it('should convert the params Record to a query string', () => {
    const params: Record<string, any> = {
      operator: 'and',
      limit: 25,
      breadcrumbs: 'Home',
      granularity: 'Hyperlocal',
    }
    const result = paramsToQueryString(params)
    expect(result).toBe('operator=and&limit=25&breadcrumbs=Home&granularity=Hyperlocal')
  })
})
