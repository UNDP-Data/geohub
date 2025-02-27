import { Endpoint, z, type RouteModifier, error as appError } from 'sveltekit-api';
import { AddSecurictyModifier } from '$api/securityModifier';
import { isSuperuser } from '$lib/server/helpers/isSuperuser';
import StorymapManager from '$lib/server/StorymapManager';
import { AccessLevel } from '$lib/config/AppConfig';
import type { Link, Pages, StorymapsData } from '$lib/types';
import { pageNumber } from '$lib/server/helpers/pageNumber';
import { error } from '@sveltejs/kit';

export const Output = z.custom<StorymapsData>().describe('Storymap search result');

export const Query = z.object({
	query: z
		.string()
		.optional()
		.describe('free text to search in title, description in storymap header and chapters'),
	limit: z
		.string()
		.optional()
		.default('10')
		.describe('The number of datasets retrieved. default is 10'),
	sortby: z
		.string()
		.optional()
		.default('updatedat, desc')
		.describe(
			`sorting column (title, createdat, updateat or no_stars) and sorting order. e.g., 'updatedat, desc'. if asc or desc is skipped, asc will be used.`
		),
	offset: z.string().optional().default('0').describe('Offset value for paging. default is 0'),
	accesslevel: z
		.enum([
			`${AccessLevel.ALL}`,
			`${AccessLevel.PRIVATE}`,
			`${AccessLevel.ORGANIZATION}`,
			`${AccessLevel.PUBLIC}`
		])
		.optional()
		.default(`${AccessLevel.PRIVATE}`)
		.describe('Access Level published to -1: All, 1: login user 2: UNDP 3: public'),
	staronly: z
		.string()
		.optional()
		.default('false')
		.describe('if true, only search for favourite datasets'),
	mydata: z
		.string()
		.optional()
		.default('false')
		.describe(`If true, only search for signed user's storymaps. default is false`)
});

export const Modifier: RouteModifier = (c) => {
	c.summary = 'Search storymaps';
	c.description =
		'Search storymaps with user specified conditions such as query text, access level, etc.';
	c.tags = ['storymap'];
	c = AddSecurictyModifier(c);
	return c;
};

export const Error = {
	404: appError(404, `No storymap found.`),
	403: appError(403, 'Permission error')
};

export default new Endpoint({ Query, Output, Modifier }).handle(async (param, { locals, url }) => {
	const session = await locals.auth();
	const user_email = session?.user.email as string;

	const _limit = param.limit || 10;
	const limit = Number(_limit);
	const _offset = param.offset || 0;
	const offset = Number(_offset);

	let is_superuser = false;
	if (user_email) {
		is_superuser = await isSuperuser(user_email);
	}

	let query = param.query as string;

	const values = [];
	if (query) {
		// normalise query text for to_tsquery function
		query = query
			.toLowerCase()
			.replace(/\r?\s+and\s+/g, ' & ') // convert 'and' to '&'
			.replace(/\r?\s+or\s+/g, ' | '); // convert 'or' to '|'
		values.push(query);
	}

	const accessLevel = Number(param.accesslevel ?? `${AccessLevel.ALL}`) as AccessLevel;

	const _onlyStar = param.staronly || 'false';
	const onlyStar = _onlyStar.toLowerCase() === 'true';

	const _onlyMydata = param.mydata || 'false';
	const mydataOnly = _onlyMydata.toLowerCase() === 'true';

	const sortby = param.sortby;
	let sortByColumn = 'updatedat';
	let sortOrder: 'asc' | 'desc' = 'desc';
	if (sortby) {
		const values = sortby.split(',');
		const column: string = values[0].trim().toLowerCase();
		const targetSortingColumns = ['title', 'createdat', 'updatedat', 'no_stars'];
		const targetSortingOrder = ['asc', 'desc'];
		if (!targetSortingColumns.includes(column)) {
			error(400, {
				message: `Bad parameter for 'sortby'. It must be one of '${targetSortingColumns.join(
					', '
				)}'`
			});
		}
		sortByColumn = column;

		if (values.length > 1) {
			const order: string = values[1].trim().toLowerCase();
			if (!targetSortingOrder.includes(order)) {
				error(400, {
					message: `Bad parameter for 'sortby'. Sorting order must be one of '${targetSortingOrder.join(
						', '
					)}'`
				});
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
		story.links = story.links?.map((l) => {
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

	return { stories, links, pages };
});
