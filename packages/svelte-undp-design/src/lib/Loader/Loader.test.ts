import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Loader from './Loader.svelte';

describe('Loader component', () => {
	it('Should show Loader', async () => {
		const { getByTestId } = render(Loader, {
			props: {
				size: 'medium'
			}
		});
		expect(getByTestId('loader')).toBeTruthy();
	});
});
