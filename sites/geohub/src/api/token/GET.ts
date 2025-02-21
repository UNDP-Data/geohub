import { Endpoint, z, error as apiError, type RouteModifier } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { signJWT, verifyJWT, type TokenPayload } from '$lib/server/token';
import { error } from '@sveltejs/kit';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';

export const Output = z
	.object({
		token: z.string().describe('JWT access token issued'),
		expiry: z.string().describe('Expiry date of the token issued.')
	})
	.openapi({
		example: {
			token:
				'eyJhbGciOiJIUzI1NiJ9.eyJpZCI6ImE4NTUxNmM4MWMwYjc4ZDNlODlkM2YwMDA5OWI4YjE1IiwibmFtZSI6IkppbiBJZ2FyYXNoaSIsImVtYWlsIjoiamluLmlnYXJhc2hpQHVuZHAub3JnIiwiZXhwIjoxNzM5MTg4NjkyLCJpYXQiOjE3MzkxODUwOTIsImlzcyI6IlVuaXRlZCBOYXRpb25zIERldmVsb3BtZW50IFByb2dyYW1tZSJ9',
			expiry: '2025-02-10T11:58:12.000Z'
		}
	});

export const Query = z.object({
	duration: z
		.string()
		.optional()
		.describe('The duration, that the token will be valid. Only valid for approved users.')
});

export const Error = {
	403: apiError(403, 'Permission error')
};

const description = `
Generate an access token for GeoHub APIs. The permission of a token issued will follow the user's permission who issues. This token is only valid within \`/api\` endpoints. Pages have to be authenticated with SSO through authentication providers.

Only approved users can specify expiration time with \`duration\` query param. Otherwise, a token will be expired in an hour as default.

Regarding to the format of expiration time, please follow the below formats.

Format used for time span should be a number followed by a unit, such as \`5 minutes\` or \`1 day\`.

Valid units are: 
- \`sec\`, \`secs\`, \`second\`, \`seconds\`, \`s\`
- \`minute\`, \`minutes\`, \`min\`, \`mins\`, \`m\`, 
- \`hour\`, \`hours\`, \`hr\`, \`hrs\`, \`h\`, 
- \`day\`, \`days\`, \`d\`, 
- \`week\`, \`weeks\`, \`w\`, 
- \`year\`, \`years\`, \`yr\`, \`yrs\`, \`y\`. 

It is not possible to specify months. 365.25 days is used as an alias for a year.
`;

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Generate an access token for API';
	c.description = description;
	c.tags = ['token'];
	c = AddSecurictyModifier(c);
	return c;
};

export default new Endpoint({ Query, Output, Error, Modifier }).handle(
	async (param, { locals }) => {
		const session = await locals.auth();
		if (!session) error(403, { message: 'Permission error' });

		const user = session.user;
		const user_email = user.email;
		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		let duration = param.duration;
		if (duration && !is_superuser) {
			error(403, { message: 'Only approved users can specify duration to expire.' });
		}

		if (!duration) {
			// default expiry is 1 hour
			duration = '1h';
		}

		const payload: { [key: string]: string } = {
			id: user.id,
			name: user.name,
			email: user_email
		};

		const token = await signJWT(payload, { exp: duration });

		const decoded: TokenPayload = await verifyJWT(token);
		const expiry = new Date(decoded.exp * 1000).toISOString();

		return {
			token,
			expiry
		};
	}
);
