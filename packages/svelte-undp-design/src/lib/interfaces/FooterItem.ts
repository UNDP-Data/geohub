export interface FooterItem {
	title: string;
	url: string;
	callback?: () => void;
	preloadCode?: 'eager' | 'hover' | 'off' | 'tap' | 'viewport';
	preloadData?: 'hover' | 'off' | 'tap';
}
