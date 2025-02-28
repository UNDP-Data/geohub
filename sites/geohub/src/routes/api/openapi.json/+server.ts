import api from '$api';
import { json } from '@sveltejs/kit';
import type { RequestEvent, RequestHandler } from './$types';

export const GET: RequestHandler = async (event: RequestEvent) => json(await api.openapi(event));
