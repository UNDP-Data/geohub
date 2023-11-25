import { createTippy, type TippyProps } from 'svelte-tippy';

/**
 * Create Tippy object
 * see available options here.
 * https://atomiks.github.io/tippyjs/v6/all-props/
 * @param options TippyProps
 * @param trigger check https://atomiks.github.io/tippyjs/v6/all-props/#trigger
 * @returns Tippy object
 */
export const initTippy = (options?: TippyProps, trigger: string = 'click') => {
	let props: TippyProps = {
		arrow: true,
		// offset: [0, 10],
		theme: 'light',
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		trigger: trigger,
		hideOnClick: 'toggle',
		interactive: true,
		onShow(instance) {
			instance.popper.querySelector('.close')?.addEventListener('click', () => {
				instance.hide();
			});
		},
		onHide(instance) {
			instance.popper.querySelector('.close')?.removeEventListener('click', () => {
				instance.hide();
			});
		},
		onClickOutside(instance) {
			instance.hide();
		}
	};

	if (options) {
		props = Object.assign(props, options);
	}

	const tippy = createTippy(props);
	return tippy;
};
