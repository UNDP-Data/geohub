export interface MultiSelectItem {
	id: string;
	label: string;
	checked: boolean;
	value: unknown;
	children?: MultiSelectItem[];
}
