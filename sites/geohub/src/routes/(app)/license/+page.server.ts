import type { PageServerLoad } from './$types';

interface License {
	name: string;
	versions: string[];
	paths: string[];
	license: string;
	author: string;
	homepage: string;
	description: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch(`/license.json`);
	const licenses: { [key: string]: License[] } = await res.json();

	return {
		licenses
	};
};
