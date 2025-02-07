import { API } from 'sveltekit-api';
import packageJson from '../../package.json' assert { type: 'json' };
const { version } = packageJson;

const description = `
This documentation describes GeoHub Static Image API Spec.

The standard api (\`/api/style/static\`) provides three different ways to produce a static image from a given maplibre style.

- \`bbox\`: generate an image for a bounding box
- \`center, zoom\`: generate an image for a given center coordinates and zoom. Bearing and pitch can be given if necessary.
- \`auto\`: generate an image based on the default location settings in maplibre style.

This API also supports \`pmtiles://\` protocol.

each type of endpoint has both GET and POST method. GET method receives maplibre style with \`url\` query param while POST method consumes style.JSON as a body.

Apart from standard endpoints, this API also provides a simple endpoint (\`/api/og\`) to generate open graph image for page metadata.
`;

const api = new API(
	import.meta.glob('./**/*.ts'),
	{
		openapi: '3.0.0',
		info: {
			title: 'GeoHub Static Image API',
			version: version,
			description: description,
			license: {
				name: 'MIT',
				url: 'https://github.com/UNDP-Data/geohub/blob/develop/LICENSE'
			},
			contact: { name: 'United Nations Development Programme', email: 'data@undp.org' }
		}
	},
	'/api'
);

export default api;
