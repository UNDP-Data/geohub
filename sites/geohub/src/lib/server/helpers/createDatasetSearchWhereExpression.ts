import { AccessLevel, DatasetSearchQueryParams } from '$lib/config/AppConfig';
import { getDomainFromEmail } from '$lib/helper';

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
	let bboxCoordinates: number[];
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
			value: key.toLowerCase()
		});
	});

	const _onlyStar = url.searchParams.get('staronly') || 'false';
	const onlyStar = _onlyStar.toLowerCase() === 'true';

	const values = [];
	if (query) {
		// normalise query text for to_tsquery function
		queryOperator = queryOperator.trim().toLowerCase();
		query = query.toLowerCase().replace(/\s/g, ` ${queryOperator === 'and' ? '&' : '|'} `);
		values.push(query);
	}

	const mydata = url.searchParams.get('mydata');
	const mydataonly = mydata && mydata === 'true' ? true : false;

	const domain = user_email ? getDomainFromEmail(user_email) : undefined;

	const sql = `
    WHERE 
    NOT ST_IsEmpty(${tableAlias}.bounds)
    ${
			!query
				? ''
				: `
    AND (
      to_tsvector(${tableAlias}.name) @@ to_tsquery($1)
     OR to_tsvector(${tableAlias}.description) @@ to_tsquery($1)
     )`
		}
    ${
			operator === 'and'
				? getTagFilterAND(filters, values, tableAlias)
				: getTagFilterOR(filters, values, tableAlias)
		}
    ${getBBoxFilter(bboxCoordinates, values, tableAlias)}
    ${
			onlyStar && user_email
				? `
    and exists (
      SELECT dataset_id FROM geohub.dataset_favourite WHERE dataset_id=${tableAlias}.id AND user_email='${user_email}'
    )
    `
				: ''
		}
    ${
			!is_superuser && user_email && mydataonly
				? `
    AND EXISTS (SELECT dataset_id FROM geohub.dataset_permission WHERE dataset_id = ${tableAlias}.id AND user_email = '${user_email}' )`
				: ''
		}
	${
		!user_email
			? `AND ${tableAlias}.access_level=${AccessLevel.PUBLIC}`
			: `
	AND  (
		(${tableAlias}.access_level=${AccessLevel.PRIVATE} AND ${tableAlias}.created_user='${user_email}')
		OR
		(${tableAlias}.access_level=${AccessLevel.ORGANIZATION} AND ${tableAlias}.created_user LIKE '%${domain}')
		OR
		(${tableAlias}.access_level=${AccessLevel.PUBLIC})
		)
	`
	}
    `;

	return {
		sql,
		values
	};
};

const getTagFilterOR = (
	filters: { key?: string; value: string }[],
	values: string[],
	tableAlias: string
) => {
	if (filters.length === 0) return '';
	return `
      AND EXISTS(
        SELECT a.id 
        FROM geohub.tag as a 
        INNER JOIN geohub.dataset_tag as b
        ON a.id = b.tag_id
        WHERE b.dataset_id = ${tableAlias}.id AND (
      ${filters
				.map((filter) => {
					values.push(filter.key);
					const keyLength = values.length;
					values.push(`'${filter.value}'`);
					const valueLength = values.length;
					return `(a.key = $${keyLength} and to_tsvector(a.value) @@ to_tsquery($${valueLength})) `;
				})
				.join('OR')}
      ))`;
};

const getTagFilterAND = (
	filters: { key?: string; value: string }[],
	values: string[],
	tableAlias: string
) => {
	if (filters.length === 0) return '';
	return `
      AND EXISTS(
        SELECT dataset_id FROM (
      ${filters
				.map((filter) => {
					values.push(filter.key);
					const keyLength = values.length;
					values.push(`'${filter.value}'`);
					const valueLength = values.length;
					return `
          SELECT b.dataset_id
          FROM geohub.tag as a 
          INNER JOIN geohub.dataset_tag as b
          ON a.id = b.tag_id
          WHERE a.key =$${keyLength} and to_tsvector(a.value) @@ to_tsquery($${valueLength}) 
          `;
				})
				.join('INTERSECT')}
        ) y
        WHERE dataset_id = ${tableAlias}.id
      )`;
};

const getBBoxFilter = (bbox: number[], values: string[], tableAlias: string) => {
	if (!(bbox && bbox.length === 4)) return '';
	bbox.forEach((val) => {
		values.push(val.toString());
	});
	return `
    AND ST_INTERSECTS(
      ${tableAlias}.bounds, 
      ST_MakeEnvelope(
        $${values.length - 3}::double precision,
        $${values.length - 2}::double precision,
        $${values.length - 1}::double precision,
        $${values.length}::double precision
        , 4326
      )
    )
    `;
};
