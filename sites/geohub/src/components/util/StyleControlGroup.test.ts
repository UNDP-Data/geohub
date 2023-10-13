import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import type { RenderResult } from '@testing-library/svelte';

import component from '$components/util/StyleControlGroup.svelte';

describe('Vector : Style Control Group ', () => {
	let sut: RenderResult<component>;

	beforeEach(() => {
		sut = render(component, { title: 'Orange' });
	});

	it('should render', async () => {
		const row = sut.getByTestId('box-title');
		await expect(row).toBeDefined();
		await expect(row.innerHTML).toContain('Orange');
	});
});
