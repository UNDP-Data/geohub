import '@testing-library/jest-dom'

import { stringifyStyleJSON } from '../helper'

describe('stringifyStyleJSON', () => {
  it('should return a string', () => {
    const json = {
      foo: 'bar',
      test: 'me',
    }

    expect(stringifyStyleJSON(JSON.parse(JSON.stringify(json)))).toEqual(`{
    "foo": "bar",
    "test": "me"
}`)
  })
})
