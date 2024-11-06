import { describe, it, expect, beforeEach } from 'vitest';
import { render, type RenderResult } from '@testing-library/svelte';
import PanelButton from './PanelButton.svelte';

describe('PanelButton', () => {
	let component: RenderResult<PanelButton>;

	beforeEach(() => {
		component = render(PanelButton, {
			props: {
				icon: 'fas fa-gear',
				isShow: true,
				width: '300px',
				tooltip: 'Tooltip'
			}
		});
	});

	it('should render', async () => {
		await expect(component.container).toBeTruthy();
	});
});
