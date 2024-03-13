import DatabaseManager from '$lib/server/DatabaseManager';
import type { Stac } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { PoolClient } from 'pg';
import type { Product } from '$lib/types/Product';

export const getSTACs = async (type?: string) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		if (type && !['api', 'catalog'].includes(type)) {
			error(400, { message: `invalid type. type param should be either api or catalog.` });
		}
		const query = {
			text: `SELECT 
            id, 
            name, 
            url, 
            type, 
            providers, 
            createdat, 
            created_user, 
            updatedat, 
            updated_user
            FROM geohub.stac
            ${type ? 'WHERE type=$1' : ''}
			`,
			values: []
		};

		if (type) {
			query.values.push(type);
		}

		const res = await client.query(query);
		const stacs: Stac[] = res.rows;
		return stacs;
	} finally {
		dbm.end();
	}
};

export const getSTAC = async (id: string) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const stac = await getSTACById(client, id);
		return stac;
	} finally {
		dbm.end();
	}
};

export const upsertSTAC = async (stac: Stac, user_email: string) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const requiredProps = ['id', 'name', 'url', 'type'];
		requiredProps.forEach((prop) => {
			if (prop in stac) return;
			error(400, `${prop} property is required`);
		});

		const now = new Date().toISOString();

		const query = {
			text: `INSERT INTO geohub.stac
            (
                id, 
                name, 
                url, 
                type, 
                providers, 
                createdat, 
                created_user
            )
            values (
                $1,
                $2,
                $3,
                $4,
                $5,
                $6::timestamptz,
                $7
            )
            ON CONFLICT (id)
            DO
            UPDATE
             SET
                name=$2, 
                url=$3, 
                type=$4, 
                providers=$5, 
                updatedat=$6,
                updated_user=$7
            `,
			values: [
				stac.id,
				stac.name,
				stac.url,
				stac.type,
				JSON.stringify(stac.providers),
				now,
				user_email
			]
		};

		await client.query(query);

		return stac;
	} finally {
		dbm.end();
	}
};

export const deleteSTAC = async (id: string) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const stac = await getSTACById(client, id);
		if (!stac) {
			error(404, { message: 'Not found' });
		}

		const query = {
			text: `DELETE FROM geohub.stac WHERE id=$1`,
			values: [id]
		};

		await client.query(query);

		return;
	} finally {
		dbm.end();
	}
};

const getSTACById = async (client: PoolClient, id: string) => {
	const query = {
		text: `SELECT 
        id, 
        name, 
        url, 
        type, 
        providers, 
        createdat, 
        created_user, 
        updatedat, 
        updated_user
        FROM geohub.stac
        WHERE id=$1
        `,
		values: [id]
	};

	const res = await client.query(query);
	const stac: Stac = res.rows.length > 0 ? res.rows[0] : undefined;
	return stac;
};

export const getProductDetails = async (product_id: string) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	const query = {
		text: `SELECT id, label, expression, description FROM geohub.product WHERE id=$1`,
		values: [product_id]
	};

	const res = await client.query(query);
	return res.rows.length > 0 ? res.rows[0] : undefined;
};

export const getStacCollectionProducts = async (stac_id, collection_id) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	if (!stac_id) {
		error(400, { message: 'stac_id is required' });
	}
	let query = {
		text: `SELECT * FROM geohub.stac_collection_product JOIN geohub.product ON geohub.stac_collection_product.product_id = geohub.product.id WHERE stac_id=$1 AND collection_id=$2`,
		values: [stac_id, collection_id]
	};
	if (!collection_id) {
		// get all products for the stac id provided
		query = {
			text: `SELECT * FROM geohub.stac_collection_product JOIN geohub.product ON geohub.stac_collection_product.product_id = geohub.product.id WHERE stac_id=$1`,
			values: [stac_id]
		};
	}

	const res = await client.query(query);
	return res.rows.length > 0 ? res.rows : undefined;
};

export const registerProduct = async (product: Product) => {
	try {
		const dbm = new DatabaseManager();
		const client = await dbm.start();

		const query2 = {
			text: `INSERT INTO geohub.stac_collection_product (stac_id, collection_id, product_id, assets)
				   VALUES ($1, $2, $3, $4) ON CONFLICT (stac_id, collection_id, product_id) \
					DO
			UPDATE SET stac_id = EXCLUDED.stac_id, assets = EXCLUDED.assets
			WHERE stac_collection_product.stac_id = EXCLUDED.stac_id
			  AND stac_collection_product.collection_id = EXCLUDED.collection_id
			  AND stac_collection_product.product_id = EXCLUDED.product_id`,
			values: [product.stac_id, product.collection, product.id, product.assets]
		};
		await client.query(query2);

		const query = {
			text: `INSERT INTO geohub.product (id, label, expression, description)
				   VALUES ($1, $2, $3, $4)
					   ON CONFLICT (id)
           DO UPDATE SET label = COALESCE(EXCLUDED.label, geohub.product.label),
										 expression = COALESCE(EXCLUDED.expression, geohub.product.expression),
										 description = COALESCE(EXCLUDED.description, geohub.product.description)`,
			values: [product.id, product.label, product.expression, product.description]
		};

		await client.query(query);
		return true;
	} catch (err) {
		return err;
	}
};

export const deleteProduct = async (product_id: string) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		const query = {
			text: `DELETE FROM geohub.product WHERE id=$1`,
			values: [product_id]
		};
		await client.query(query);
		return true;
	} catch (err) {
		return err;
	}
};
