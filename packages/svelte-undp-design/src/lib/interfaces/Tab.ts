export interface Tab {
	label: string;
	icon?: string;
	labelFunction?: (label: string) => string;
}
