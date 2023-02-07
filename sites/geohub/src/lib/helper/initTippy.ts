import { createTippy, type TippyProps } from 'svelte-tippy'

export const initTippy = (options?: TippyProps) => {
  let props: TippyProps = {
    arrow: true,
    // offset: [0, 10],
    theme: 'light',
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    trigger: 'click',
    hideOnClick: 'toggle',
    interactive: true,
    onShow(instance) {
      instance.popper.querySelector('.close')?.addEventListener('click', () => {
        instance.hide()
      })
    },
    onHide(instance) {
      instance.popper.querySelector('.close')?.removeEventListener('click', () => {
        instance.hide()
      })
    },
    onClickOutside(instance) {
      instance.hide()
    },
  }

  if (options) {
    props = Object.assign(props, options)
  }

  const tippy = createTippy(props)
  return tippy
}
