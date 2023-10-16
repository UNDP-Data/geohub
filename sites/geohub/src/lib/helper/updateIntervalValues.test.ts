import { describe, it, expect } from 'vitest';
import { updateIntervalValues } from '$lib/helper';
import type { ColorMapRow } from '$lib/types';

describe('updateIntervalValues', () => {
	it('should return the colorMapRows with the updated values', async () => {
		const colorMapRows: ColorMapRow[] = [
			{ start: 0, end: 10, color: [255, 2, 23, 255] },
			{ start: 10, end: 20, color: [212, 45, 12, 255] },
			{ start: 20, end: 30, color: [87, 21, 64, 255] },
			{ start: 30, end: 40, color: [2, 230, 250, 255] },
			{ start: 40, end: 50, color: [0, 0, 0, 0] }
		];
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		const event: CustomEvent = {
			detail: {
				index: 0,
				id: 'end',
				value: 5
			}
		};
		const result = updateIntervalValues(event, colorMapRows);
		await expect(result).toEqual([
			{ start: 0, end: 5, color: [255, 2, 23, 255] },
			{ start: 5, end: 20, color: [212, 45, 12, 255] },
			{ start: 20, end: 30, color: [87, 21, 64, 255] },
			{ start: 30, end: 40, color: [2, 230, 250, 255] },
			{ start: 40, end: 50, color: [0, 0, 0, 0] }
		]);
	});
});
