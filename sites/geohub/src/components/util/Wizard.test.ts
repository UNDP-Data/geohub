import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import Wizard from '$components/util/Wizard.svelte';

describe('Wizard component', () => {
	it('should render', async () => {
		const component = await render(Wizard, { props: { initialStep: 1 } });
		expect(component).toBeDefined();
	});
	it('should render the slotted content', async () => {
		const component = await render(Wizard, { props: { initialStep: 1 } });
		expect(component.getByTestId('slotted-content')).toBeDefined();
	});
});
