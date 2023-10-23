export interface MultiSelectItem {
	id: string;
	label: string;
	checked: boolean;
	children?: MultiSelectItem[];
}
