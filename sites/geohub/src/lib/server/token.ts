import { JWT_SECRET_KEY } from '$env/dynamic/private';
import { SignJWT, jwtVerify } from 'jose';
import { error } from '@sveltejs/kit';

export interface TokenPayload {
	id: string;
	name: string;
	email: string;
	exp: number;
	iat: number;
	iss: string;
}

/**
 * Issue a token
 * @param payload payload to be included in token
 * @param options expriry time should be set to 'exp' property.
 * Plese refer https://github.com/panva/jose/blob/main/docs/classes/jwt_sign.SignJWT.md#setexpirationtime
 * @returns signed JWT token
 */
export const signJWT = async (payload: { [key: string]: string }, options: { exp: string }) => {
	const secret = new TextEncoder().encode(JWT_SECRET_KEY);
	const alg = 'HS256';
	return new SignJWT(payload)
		.setProtectedHeader({ alg })
		.setExpirationTime(options.exp)
		.setIssuedAt()
		.setIssuer('United Nations Development Programme')
		.sign(secret);
};

/**
 * verify a token
 * @param token JWT token
 * @returns payload
 * @throws 403 error is returned if token is expired or not valid
 */
export const verifyJWT = async <TokenPayload>(token: string): Promise<TokenPayload> => {
	try {
		return (await jwtVerify(token, new TextEncoder().encode(JWT_SECRET_KEY)))
			.payload as TokenPayload;
	} catch {
		error(403, { message: 'Token is invalid' });
	}
};
