import type { RequestHandler } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const targetUrl = url.searchParams.get('url');

	if (!targetUrl || !targetUrl.startsWith('http://')) {
		error(400, 'Invalid or missing "url" parameter');
	}

	const response = await fetch(targetUrl);

	if (!response.ok) {
		error(response.status, `Failed to fetch content from ${targetUrl}`);
	}

	const contentType = response.headers.get('content-type') || 'application/octet-stream';
	let body: BodyInit = await response.arrayBuffer();
	if (contentType.includes('application/json')) {
		body = await response.json();
	} else if (contentType.includes('text/')) {
		body = await response.text();
	} else {
		body = await response.arrayBuffer();
	}
	return new Response(body, {
		status: response.status,
		headers: {
			'Content-Type': contentType
		}
	});
};
