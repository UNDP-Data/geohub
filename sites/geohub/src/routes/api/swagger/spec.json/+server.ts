import type { RequestHandler } from './$types';
import yaml from 'js-yaml';

export const GET: RequestHandler = async (event) => {
	const res = await event.fetch('/api/swagger/spec.yaml');
	const blob = await res.blob();
	const yamlAsString = await blob.text();
	const json = yaml.load(yamlAsString);
	return new Response(JSON.stringify(json));
};
