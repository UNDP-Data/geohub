import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import CardWithImage from './CardWithImage.svelte';

describe('CardWithImage component', () => {
	it('Should show a given title', () => {
		const { getAllByText } = render(CardWithImage, { props: { linkName: 'Show more' } });
		expect(getAllByText('Show more')).toBeTruthy();
	});
});
