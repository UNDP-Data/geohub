import EarthSearchStac from './EarthSearchStac';
import MicrosoftPlanetaryStac from './MicrosoftPlanetaryStac';
import type { StacTemplate } from './StacTemplate';

export const getStacInstance = (stacType: string, collection: string) => {
	let stacInstance: StacTemplate;
	if (stacType === 'microsoft-pc') {
		stacInstance = new MicrosoftPlanetaryStac(collection);
	} else if (stacType === 'earth-search') {
		stacInstance = new EarthSearchStac(collection);
	}
	return stacInstance;
};
