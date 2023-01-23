export interface HeaderLink {
	href: string;
	id: string;
	title: string;
	icon?: string;
	callback?: (id: string) => void;
}
