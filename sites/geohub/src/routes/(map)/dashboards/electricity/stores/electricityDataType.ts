import type { SegmentButton } from '@undp-data/svelte-undp-components';
import { writable, type Writable } from 'svelte/store';

export const electricityDataTypes: SegmentButton[] = [
	{
		title: 'Settlement-Level Electricity Access (2012-2020)',
		value: [2012, 2020]
	},
	{
		title: 'Electricity Access Forecast (2021-2030)',
		value: [2021, 2030]
	}
];

export const ELECTRICITY_DATATYPE_CONTEXT_KEY = 'electricity-data-type-store';
export type ElectricityDataTypeStore = Writable<number[]>;
export const createElectricityDataTypeStore = () => {
	return writable(<string>electricityDataTypes[0].value);
};
