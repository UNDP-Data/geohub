export interface HeaderLink {
	href: string;
	id: string;
	title: string;
	tooltip?: string;
	callback?: (id: string) => void;
}
