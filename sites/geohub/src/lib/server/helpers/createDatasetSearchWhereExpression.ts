import { AccessLevel, DatasetSearchQueryParams, Permission } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';
import { SQL, sql } from 'drizzle-orm';

export const createDatasetSearchWhereExpression = async (
	url: URL,
	tableAlias: string,
	is_superuser: boolean,
	user_email?: string
) => {
	let query = url.searchParams.get('query');
	let queryOperator = url.searchParams.get('queryoperator');
	if (!(queryOperator && ['and', 'or'].includes(queryOperator.trim().toLowerCase()))) {
		queryOperator = 'and';
	}
	const bbox = url.searchParams.get('bbox');
	let bboxCoordinates: number[] = [];
	if (bbox) {
		bboxCoordinates = bbox.split(',').map((val) => Number(val));
		if (bboxCoordinates.length !== 4) {
			throw new Error('Invalid bbox');
		}
	}

	const operatorOptions = ['and', 'or'];
	const operator = url.searchParams.get('operator') ?? operatorOptions[0];
	if (!(operator && operatorOptions.includes(operator.toLowerCase()))) {
		throw new Error(
			`Bad parameter for 'operator'. It must be one of '${operatorOptions.join(', ')}'`
		);
	}

	const filters: { key: string; value: string }[] = [];
	url.searchParams.forEach((key, value) => {
		if (DatasetSearchQueryParams.includes(value)) return;
		filters.push({
			key: value,
			value: key.toLowerCase().replace(/\s+/g, ` & `)
		});
	});

	const _onlyStar = url.searchParams.get('staronly') || 'false';
	const onlyStar = _onlyStar.toLowerCase() === 'true';

	if (query) {
		// normalise query text for to_tsquery function
		queryOperator = queryOperator.trim().toLowerCase();
		// ignore & char
		query = query.toLowerCase().replace(/&+|\|+/g, '');
		query = query.trim();
		// convert every space to query operator of either & or |
		query = query.toLowerCase().replace(/\s+/g, ` ${queryOperator === 'and' ? '&' : '|'} `);
		// if query string end with & or |, remove the last char
		if (query.endsWith('&') || query.endsWith('|')) {
			query = query.slice(0, query.length - 2);
			query = query.trim();
		}
	}

	const mydata = url.searchParams.get('mydata');
	const mydataonly = mydata && mydata === 'true' ? true : false;

	const accessLevel =
		(Number(url.searchParams.get('accesslevel')) as AccessLevel) ?? AccessLevel.ALL;

	const sqlChunks: SQL[] = [];

	sqlChunks.push(
		sql.raw(`
    WHERE 
    NOT ST_IsEmpty(${tableAlias}.bounds)
		`)
	);

	if (query) {
		sqlChunks.push(
			sql.raw(
				`AND (to_tsvector(${tableAlias}.name) @@ to_tsquery('${query}') OR to_tsvector(${tableAlias}.description) @@ to_tsquery('${query}'))`
			)
		);
	}

	if (operator === 'and') {
		sqlChunks.push(getTagFilterAND(filters, tableAlias));
	} else {
		sqlChunks.push(getTagFilterOR(filters, tableAlias));
	}

	sqlChunks.push(getBBoxFilter(bboxCoordinates, tableAlias));

	const domain = user_email ? getDomainFromEmail(user_email) : undefined;
	if (!user_email) {
		sqlChunks.push(sql.raw(`AND ${tableAlias}.access_level = ${AccessLevel.PUBLIC}`));
	} else {
		if (accessLevel === AccessLevel.PUBLIC) {
			sqlChunks.push(sql.raw(`AND ${tableAlias}.access_level = ${AccessLevel.PUBLIC}`));
		} else if (accessLevel === AccessLevel.ORGANIZATION) {
			if (domain) {
				sqlChunks.push(
					sql.raw(`
				AND (
					${tableAlias}.access_level = ${AccessLevel.ORGANIZATION} AND ${tableAlias}.created_user LIKE '%${domain}'
					OR (
						${tableAlias}.access_level = ${AccessLevel.ORGANIZATION} AND ${tableAlias}.created_user LIKE '%${domain}'
						AND
						EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
					)
				)
				`)
				);
			}
		} else if (accessLevel === AccessLevel.PRIVATE) {
			sqlChunks.push(
				sql.raw(`
			AND (
				(
					${tableAlias}.access_level = ${AccessLevel.PRIVATE}
					AND
					EXISTS (SELECT dataset_id FROM geohub.dataset_permission WHERE dataset_id = ${tableAlias}.id AND user_email='${user_email}')
				)
				OR EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
			)
			`)
			);
		} else if (accessLevel === AccessLevel.ALL) {
			sqlChunks.push(
				sql.raw(`
			AND (${tableAlias}.access_level = ${AccessLevel.PUBLIC}
			${
				domain
					? `OR (
						${tableAlias}.access_level = ${AccessLevel.ORGANIZATION} AND ${tableAlias}.created_user LIKE '%${domain}'
						OR (
							${tableAlias}.access_level = ${AccessLevel.ORGANIZATION} AND ${tableAlias}.created_user LIKE '%${domain}'
							AND
							EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
						)
					)`
					: ''
			}
				OR (
					(
						${tableAlias}.access_level = ${AccessLevel.PRIVATE}
						AND
						EXISTS (SELECT dataset_id FROM geohub.dataset_permission WHERE dataset_id = ${tableAlias}.id AND user_email='${user_email}')
					)
					OR EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
				)
			)
			`)
			);
		}
	}

	if (onlyStar && user_email) {
		sqlChunks.push(
			sql.raw(`
		AND EXISTS (
		SELECT dataset_id FROM geohub.dataset_favourite WHERE dataset_id=${tableAlias}.id AND user_email='${user_email}'
		)
		`)
		);
	}

	if (!is_superuser && user_email && mydataonly) {
		sqlChunks.push(
			sql.raw(
				`AND EXISTS (SELECT dataset_id FROM geohub.dataset_permission WHERE dataset_id = ${tableAlias}.id AND user_email = '${user_email}' AND permission >= ${Permission.READ} )`
			)
		);
	}

	return sql.join(sqlChunks, sql.raw(' '));
};

const getTagFilterOR = (filters: { key?: string; value: string }[], tableAlias: string) => {
	if (filters.length === 0) return sql.raw('');
	return sql.raw(`
      AND EXISTS(
        SELECT a.id 
        FROM geohub.tag as a 
        INNER JOIN geohub.dataset_tag as b
        ON a.id = b.tag_id
        WHERE b.dataset_id = ${tableAlias}.id AND (
      ${filters
				.map((filter) => {
					return `(a.key = '${filter.key}' and to_tsvector(a.value) @@ to_tsquery('${filter.value}')) `;
				})
				.join('OR')}
      ))`);
};

const getTagFilterAND = (filters: { key?: string; value: string }[], tableAlias: string) => {
	if (filters.length === 0) return sql.raw('');

	return sql.raw(`
      AND EXISTS(
        SELECT dataset_id FROM (
      ${filters
				.map((filter) => {
					return `
          SELECT b.dataset_id
          FROM geohub.tag as a 
          INNER JOIN geohub.dataset_tag as b
          ON a.id = b.tag_id
          WHERE a.key = '${filter.key}' and to_tsvector(a.value) @@ to_tsquery('${filter.value}') 
          `;
				})
				.join('INTERSECT')}
        ) y
        WHERE dataset_id = ${tableAlias}.id
      )`);
};

const getBBoxFilter = (bbox: number[], tableAlias: string) => {
	if (!(bbox && bbox.length === 4)) return sql.raw('');
	return sql.raw(`
    AND ST_INTERSECTS(
      ${tableAlias}.bounds, 
      ST_MakeEnvelope(
        ${bbox[0]}::double precision,
        ${bbox[1]}::double precision,
        ${bbox[2]}::double precision,
        ${bbox[3]}::double precision
        , 4326
      )
    )
    `);
};
