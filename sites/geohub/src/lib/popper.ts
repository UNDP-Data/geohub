import { createPopperActions, type ReferenceAction } from 'svelte-popperjs'

export default class Popper {
  private ref: ReferenceAction = undefined
  private content = undefined
  private options = {
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 4],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          mainAxis: true,
        },
      },
    ],
  }

  constructor(options, offset = [0, 4]) {
    const [popperRef, popperContent] = createPopperActions(options)
    this.options.modifiers[0].options.offset = offset
    this.ref = popperRef
    this.content = popperContent
  }

  public init() {
    return {
      ref: this.ref,
      options: this.options,
      content: this.content,
    }
  }
}
