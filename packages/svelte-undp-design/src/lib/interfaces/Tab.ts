export interface Tab {
	id: string;
	label: string;
	icon?: string;
	labelFunction?: (label: string) => string;
}
