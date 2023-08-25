export interface HeaderLink {
	href: string;
	id: string;
	title: string;
	tooltip?: string;
	callback?: (id: string) => void;
	preloadCode?: 'eager' | 'hover' | 'off' | 'tap' | 'viewport';
	preloadData?: 'hover' | 'off' | 'tap';
}
