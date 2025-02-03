import { API } from 'sveltekit-api';
import packageJson from '../../package.json' assert { type: 'json' };
const { version } = packageJson;

const api = new API(
	import.meta.glob('./**/*.ts'),
	{
		openapi: '3.0.0',
		info: {
			title: 'GeoHub Static Image API',
			version: version,
			description: 'This documentation describes GeoHub Static Image API Spec.',
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
