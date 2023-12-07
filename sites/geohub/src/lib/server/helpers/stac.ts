import DatabaseManager from '$lib/server/DatabaseManager';
import type { Stac } from '$lib/types';
import { error } from '@sveltejs/kit';
import type { PoolClient } from 'pg';

export const getSTACs = async (type?: string) => {
	const dbm = new DatabaseManager();
	const client = await dbm.start();
	try {
		if (type && !['api', 'catalog'].includes(type)) {
			throw error(400, { message: `invalid type. type param should be either api or catalog.` });
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
			throw error(400, `${prop} property is required`);
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
			throw error(404, { message: 'Not found' });
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
