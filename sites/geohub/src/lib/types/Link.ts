export interface Link {
	rel: string;
	type: string;
	href: string;
	method?: string;
	body?: { [key: string]: string };
	title?: string;
	date?: string;
}
