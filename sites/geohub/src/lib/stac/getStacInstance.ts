import type { Stac } from '$lib/types';
import EarthSearchStac from './EarthSearchStac';
import MicrosoftPlanetaryStac from './MicrosoftPlanetaryStac';
import type { StacTemplate } from './StacTemplate';

export const getStacInstance = (stac: Stac, collection: string) => {
	let stacInstance: StacTemplate;
	if (stac.id === 'microsoft-pc') {
		stacInstance = new MicrosoftPlanetaryStac(collection, stac);
	} else if (stac.id === 'earth-search') {
		stacInstance = new EarthSearchStac(collection, stac);
	}
	return stacInstance;
};
