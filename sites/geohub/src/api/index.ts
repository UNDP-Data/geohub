import { API } from 'sveltekit-api';
import packageJson from '../../package.json' assert { type: 'json' };
const { version } = packageJson;

const description = `
This documentation describes GeoHub's endpoints specification.

Our core API is \`/api/datasets\` which allows users to search GeoHub datasets freely. It returns the response as GeoJSON feature collection and looks like similar to STAC response. Once you received the datasets details, you can handle them with our tiling servers. All our datasets are cloud optimised either \`COG (Cloud Optimised GeoTiff)\` or \`PMTiles\`.

## Raster datasets
You can use our dynamic rater tiling servers - [titiler](https://titiler.undpgeohub.org/) and [titiler-dev](https://titiler-dev.undpgeohub.org/)

## Vector datasets
Generally, vector tiles can be handled with [maplibre-gl-js](https://maplibre.org/projects/maplibre-gl-js/). But if the dataset's URL starts with \`pmtiles://\`, you can use [PMTiles Javascript API](https://protomaps.com/docs/frontends/maplibre) to add new protocol to your maplibre.

## Community maps API
You can also get style.json of saved map style through \`/api/style\` endpoints.

## Authentication
Some endpoints (for \`GET\`, \`POST\`, \`PUT\`, \`DELETE\` apis) with a padlock icon are required to sign in prior to using them. GeoHub uses either Azure Active Directory or GitHub authentication with Auth.js package. Auth.js package provides the following endpoints to [sign in](/auth/signIn) / [sign out](auth/signout). Please sign in first before trying swagger. If you use these endpoints without signing in, the result from the server might be different.

Or you can use \`token\` query param to access with a valid access token for \`/api\` endpoints which have a padlock icon in swagger. A token can be issued through \`/api/token\` endpoint after you sign in with SSO. Default expiry time of a token is an hour, if you need a token with longer expiry time, please contact to us.

## Issues
Please feel free to report any issues on GitHub from [here](https://github.com/UNDP-Data/geohub/issues). Or if you have any questions, please create a thread in GitHub's [discussions](https://github.com/UNDP-Data/geohub/discussions) page.
`;

const api = new API(
	import.meta.glob('./**/*.ts'),
	{
		openapi: '3.0.0',
		info: {
			title: 'GeoHub API specification',
			version: version,
			description: description,
			license: {
				name: 'BSD-3-Clause license',
				url: 'https://github.com/UNDP-Data/geohub/blob/develop/LICENSE'
			},
			contact: { name: 'jin.igarashi@undp.org', email: 'https://geohub.data.undp.org' }
		}
	},
	'/api'
);

export default api;
