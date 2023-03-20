import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Tabs from './Tabs.svelte';

describe('Tabs component', () => {
	it('Should show given labels', async () => {
		const { getAllByText } = render(Tabs, {
			props: {
				tabs: [
					{ label: 'Data', icon: 'fas fa-database' },
					{ label: 'Layer', icon: 'fas fa-layer-group' }
				],
				activeTab: 'Data',
				height: 40,
				fontSize: 'medium',
				isToggleTab: false
			}
		});
		expect(getAllByText('Data')).toBeTruthy();
		expect(getAllByText('Layer')).toBeTruthy();
	});
});
