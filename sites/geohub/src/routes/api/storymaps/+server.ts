import type { RequestHandler } from './$types';
import type { StoryMapConfig, StoryMapChapter, Pages, Link } from '$lib/types';
import DatabaseManager from '$lib/server/DatabaseManager';
import { error } from '@sveltejs/kit';
import StorymapManager from '$lib/server/StorymapManager';
import { isSuperuser, pageNumber } from '$lib/server/helpers';
import { Permission } from '$lib/config/AppConfig';

export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.auth();
	const user_email = session?.user.email;

	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const _limit = url.searchParams.get('limit') || 10;
		const limit = Number(_limit);
		const _offset = url.searchParams.get('offset') || 0;
		const offset = Number(_offset);

		let is_superuser = false;
		if (user_email) {
			is_superuser = await isSuperuser(user_email);
		}

		let query = url.searchParams.get('query');

		const values = [];
		if (query) {
			// normalise query text for to_tsquery function
			query = query
				.toLowerCase()
				.replace(/\r?\s+and\s+/g, ' & ') // convert 'and' to '&'
				.replace(/\r?\s+or\s+/g, ' | '); // convert 'or' to '|'
			values.push(query);
		}

		const accessLevel = Number(url.searchParams.get('accesslevel') ?? '1');

		const _onlyStar = url.searchParams.get('staronly') || 'false';
		const onlyStar = _onlyStar.toLowerCase() === 'true';

		const sortby = url.searchParams.get('sortby');
		let sortByColumn = 'updatedat';
		let sortOrder: 'asc' | 'desc' = 'desc';
		if (sortby) {
			const values = sortby.split(',');
			const column: string = values[0].trim().toLowerCase();
			const targetSortingColumns = ['title', 'createdat', 'updatedat', 'no_stars'];
			const targetSortingOrder = ['asc', 'desc'];
			if (!targetSortingColumns.includes(column)) {
				return new Response(
					JSON.stringify({
						message: `Bad parameter for 'sortby'. It must be one of '${targetSortingColumns.join(
							', '
						)}'`
					}),
					{
						status: 400
					}
				);
			}
			sortByColumn = column;

			if (values.length > 1) {
				const order: string = values[1].trim().toLowerCase();
				if (!targetSortingOrder.includes(order)) {
					return new Response(
						JSON.stringify({
							message: `Bad parameter for 'sortby'. Sorting order must be one of '${targetSortingOrder.join(
								', '
							)}'`
						}),
						{
							status: 400
						}
					);
				}
				sortOrder = order as 'asc' | 'desc';
			}
		}

		const sm = new StorymapManager();
		const stories = await sm.search(
			client,
			query,
			limit,
			offset,
			accessLevel,
			onlyStar,
			sortByColumn,
			sortOrder,
			is_superuser,
			user_email
		);

		const nextUrl = new URL(url.toString());
		nextUrl.searchParams.set('limit', limit.toString());
		nextUrl.searchParams.set('offset', (Number(offset) + Number(limit)).toString());

		const links: Link[] = [
			{
				rel: 'root',
				type: 'application/json',
				href: `${url.origin}${url.pathname}`
			},
			{
				rel: 'self',
				type: 'application/json',
				href: url.toString()
			}
		];

		if (stories.length === Number(limit)) {
			links.push({
				rel: 'next',
				type: 'application/json',
				href: nextUrl.toString()
			});
		}

		if (Number(offset) > 0) {
			const previoustUrl = new URL(url.toString());
			previoustUrl.searchParams.set('limit', limit.toString());
			previoustUrl.searchParams.set('offset', (Number(offset) - Number(limit)).toString());

			links.push({
				rel: 'previous',
				type: 'application/json',
				href: previoustUrl.toString()
			});
		}

		stories.forEach((story) => {
			story.links = story.links.map((l) => {
				const _url = new URL(l.href, url.origin);
				const subUrl = _url.searchParams.get('url');
				if (subUrl) {
					_url.searchParams.set('url', new URL(subUrl, url.origin).href);
				}
				l.href = _url.href;
				return l;
			});
		});

		const totalCount = await sm.getTotalCount(
			client,
			query,
			accessLevel,
			onlyStar,
			is_superuser,
			user_email
		);
		let totalPages = Math.ceil(totalCount / Number(limit));
		if (totalPages === 0) {
			totalPages = 1;
		}

		const currentPage = pageNumber(totalCount, Number(limit), Number(offset));
		const pages: Pages = {
			totalCount,
			totalPages,
			currentPage
		};

		return new Response(JSON.stringify({ stories, links, pages }));
	} catch (err) {
		error(500, err);
	} finally {
		dbm.end();
	}
};

export const POST: RequestHandler = async ({ locals, request }) => {
	const session = await locals.auth();
	if (!session) error(403, { message: 'Permission error' });

	const user_email = session?.user.email;
	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	const body: StoryMapConfig = await request.json();

	if (!(body.chapters.length > 0)) {
		error(400, { message: 'at least a chapter is required' });
	}

	const now = new Date().toISOString();
	if (!body.created_user) {
		body.created_user = user_email;
		body.createdat = now;
	}
	body.updated_user = user_email;
	body.updatedat = now;

	body.chapters.forEach((ch) => {
		const chapter = ch as unknown as StoryMapChapter;
		chapter.created_user = body.created_user;
		chapter.createdat = body.createdat;
		chapter.updated_user = body.updated_user;
		chapter.updatedat = body.updatedat;
	});

	const dbm = new DatabaseManager();
	let storymap: StoryMapConfig;
	try {
		const client = await dbm.transactionStart();

		const sm = new StorymapManager(body);

		const story = await sm.getById(client, body.id, is_superuser, user_email);
		// if story id already exists, check user permission
		if (!(story && story.permission >= Permission.WRITE)) {
			return new Response(
				JSON.stringify({ message: `You don't have permission to edit this storymap.` }),
				{
					status: 403
				}
			);
		}

		storymap = await sm.upsert(client);
		storymap = await sm.getById(client, storymap.id, is_superuser, user_email);
	} catch (err) {
		dbm.transactionRollback();
		error(500, err);
	} finally {
		await dbm.transactionEnd();
	}
	return new Response(JSON.stringify(storymap));
};
