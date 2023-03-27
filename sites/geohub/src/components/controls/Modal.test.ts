import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, render, type RenderResult } from '@testing-library/svelte'

import Modal from '$components/controls/Modal.svelte'

let sut: RenderResult<Modal>
const dialogOpen = true
const title = 'Test Modal'
const message = 'This is a test modal'
const messageType: 'info' | 'warning' | 'error' = 'info'
const target = ''
const continueText = 'Continue'
const cancelText = 'Cancel'

describe.todo('Modal', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    sut = render(Modal, {
      dialogOpen,
      title,
      message,
      messageType,
      target,
      continueText,
      cancelText,
    })
  })

  it('should render the modal', () => {
    expect(sut.getByTestId('modal-dialog')).toBeDefined()
  })
})
