/**
 * Sidebar item object. Either href or callback must be set to an item object.
 */
export interface SidebarItem {
	/**
	 * Title of item
	 */
	title: string;
	/**
	 * href. optionnal
	 */
	href?: string;
	/**
	 * callback when it is clicked. optional
	 * @param item Clicked sidebar item object
	 * @returns void
	 */
	callback?: (item: SidebarItem) => void;
	/**
	 * Only top level item may have children for sub menu
	 */
	children?: SidebarItem[];
}
