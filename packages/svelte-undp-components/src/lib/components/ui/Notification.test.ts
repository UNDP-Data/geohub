import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/svelte';
import Notification from './Notification.svelte';

describe('Notification Component', () => {
	it('should render', () => {
		const component = render(Notification, {
			props: {
				type: 'success',
				showCloseButton: true
			}
		});
		expect(component.getByTestId('notification-div')).toBeTruthy();
	});
});
