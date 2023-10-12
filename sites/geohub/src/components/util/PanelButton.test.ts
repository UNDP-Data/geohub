import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/svelte';
import PanelButton from '$components/util/PanelButton.svelte';

describe('PanelButton', () => {
	let component;

	beforeEach(() => {
		component = render(PanelButton, {
			props: {
				icon: 'fas fa-gear',
				isShown: true
			}
		});
	});

	it('should render', async () => {
		await expect(component.container).toBeTruthy();
	});
});
