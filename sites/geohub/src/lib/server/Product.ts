/**
 * To register products in GeoHub using the /api/products endpoint
 * ALLOWED METHODS: GET, POST, PUT, DELETE
 */
import type { PoolClient, QueryResult } from 'pg';
import { error } from '@sveltejs/kit';

class Product {
	private id: string;
	private description: string;
	private expression: string;
	private label: string;

	constructor(id: string, description: string, expression: string, label: string) {
		this.id = id;
		this.description = description;
		this.expression = expression;
		this.label = label;
	}

	public async registerProduct(client: PoolClient): Promise<QueryResult> {
		const query = `INSERT INTO geohub.product (id, description, expression, label) VALUES ($1, $2, $3, $4)`;
		const values = [this.id, this.description, this.expression, this.label];
		try {
			return await client.query(query, values);
		} catch (er) {
			error(500, er);
		}
	}

	public async upsertProduct(client: PoolClient): Promise<QueryResult> {
		const query = `UPDATE geohub.product SET description=$2, expression=$3, label=$4 WHERE id=$1`;
		const values = [this.id, this.description, this.expression, this.label];
		try {
			return await client.query(query, values);
		} catch (er) {
			error(500, er);
		}
	}
}

export default Product;
