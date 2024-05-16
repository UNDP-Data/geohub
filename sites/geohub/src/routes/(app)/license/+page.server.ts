import type { PageServerLoad } from './$types';

interface License {
	author: string;
	definedVersion: string;
	department: string;
	installedVersion: string;
	licensePeriod: string;
	licenseTypeISC: string;
	link: string;
	material: string;
	name: string;
	remoteVersion: string;
}

export const load: PageServerLoad = async ({ fetch }) => {
	const res = await fetch(`/license.json`);
	const licenses: License[] = await res.json();

	return {
		licenses
	};
};
