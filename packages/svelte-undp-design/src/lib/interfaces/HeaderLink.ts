export interface HeaderLink {
	href: string;
	id: string;
	title: string;
	tooltip?: string;
	icon?: string;
	callback?: (id: string) => void;
}
