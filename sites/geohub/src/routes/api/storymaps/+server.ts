import type { RequestHandler } from './$types';
import type { StoryMapConfig, StoryMapChapter, Pages, Link } from '$lib/types';
import { error } from '@sveltejs/kit';
import StorymapManager from '$lib/server/StorymapManager';
import { isSuperuser, pageNumber } from '$lib/server/helpers';
import { Permission } from '$lib/config/AppConfig';

export const GET: RequestHandler = async ({ url, locals }) => {
	const session = await locals.auth();
	const user_email = session?.user.email as string;

	const _limit = url.searchParams.get('limit') || 10;
	const limit = Number(_limit);
	const _offset = url.searchParams.get('offset') || 0;
	const offset = Number(_offset);

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	let query = url.searchParams.get('query') as string;

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

	const _onlyMydata = url.searchParams.get('mydata') || 'false';
	const mydataOnly = _onlyMydata.toLowerCase() === 'true';

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
		query,
		limit,
		offset,
		accessLevel,
		onlyStar,
		sortByColumn,
		sortOrder,
		is_superuser,
		user_email,
		mydataOnly
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
			l.href = decodeURI(_url.href);
			return l;
		});
	});

	const totalCount = await sm.getTotalCount(
		query,
		accessLevel,
		onlyStar,
		is_superuser,
		user_email,
		mydataOnly
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

	const sm = new StorymapManager(body);

	const story = await sm.getById(body.id as string, is_superuser, user_email);
	// if story id already exists, check user permission
	if (story && !(story && story.permission >= Permission.WRITE)) {
		return new Response(
			JSON.stringify({ message: `You don't have permission to edit this storymap.` }),
			{
				status: 403
			}
		);
	}

	let storymap = await sm.upsert();
	if (storymap) {
		storymap = await sm.getById(storymap.id as string, is_superuser, user_email);
	}

	return new Response(JSON.stringify(storymap));
};
