import { Endpoint } from 'sveltekit-api';
import { Output as _Output, Modifier as _Modifier, getSpriteImage } from './[id]/GET';

export const Output = _Output;

export const Modifier = _Modifier;

export default new Endpoint({ Output, Modifier }).handle(async (_param, { url }) => {
	return getSpriteImage(url);
});
