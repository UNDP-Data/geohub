import '@testing-library/jest-dom'

import { bannerMessages } from '../../stores'
import * as helper from '../helper'
import type { BannerMessage } from '../../lib/types'

describe('stringifyStyleJSON', () => {
  it('should return a string', () => {
    const json = {
      foo: 'bar',
      test: 'me',
    }

    expect(helper.stringifyStyleJSON(JSON.parse(JSON.stringify(json)))).toEqual(`{
    "foo": "bar",
    "test": "me"
}`)
  })
})

// describe('fetchUrl', () => {
//   beforeEach(() => {
//     jest.resetAllMocks()
//   })

//   it('should return a json object upon no timeout ', async () => {
//     const { Response, Headers } = jest.requireActual('node-fetch')
//     const meta = {
//       'Content-Type': 'application/json',
//       Accept: '*/*',
//       'Breaking-Bad': '<3',
//     }

//     const headers = new Headers(meta)
//     const ResponseInit = {
//       status: 200,
//       statusText: 'fail',
//       headers,
//     }

//     const response = new Response(JSON.stringify({ data: {} }), ResponseInit)
//     const fetchWithNoTimeout = jest.spyOn(helper, 'fetchWithTimeout').mockReturnValue(Promise.resolve(response))
//     const json = await helper.fetchUrl('http://www.google.com')
//     expect(json).toEqual({ data: {} })
//     expect(fetchWithNoTimeout).toHaveBeenCalledTimes(1)
//   })

//   it('should return no json object and a banner message store should be updated upon timeout', async () => {
//     const fetchWithTimeout = jest.spyOn(helper, 'fetchWithTimeout').mockRejectedValue(new Error('TIME_OUT'))
//     const json = await helper.fetchUrl('http://www.google.com')
//     expect(json).toBeNull()
//     expect(fetchWithTimeout).toHaveBeenCalledTimes(1)

//     bannerMessages.subscribe((messages) => {
//       expect(messages).toHaveLength(1)
//       const message: BannerMessage = messages[0]
//       expect(message.type).toEqual('danger')
//       expect(message.title).toEqual('Whoops! Something went wrong.')
//       expect(message.message).toEqual('The request took longer than expected. Please try again later.')
//     })
//   })
// })
