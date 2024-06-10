/**
 * To register products in GeoHub using the /api/products endpoint
 * ALLOWED METHODS: GET, POST, PUT, DELETE
 */
import type { Product } from '$lib/types';
import type { PoolClient } from 'pg';

export class ProductManager {
	private product: Product;

	constructor(id: string, description?: string, expression?: string, label?: string) {
		this.product = {
			id,
			description,
			expression,
			label
		};
	}

	public async get(client: PoolClient): Promise<Product> {
		const query = {
			text: `SELECT id, label, expression, description FROM geohub.product WHERE id = $1`,
			values: [this.product.id]
		};
		const res = await client.query(query);
		if (res.rowCount === 0) {
			return undefined;
		}
		return res.rows[0] as Product;
	}

	public async insert(client: PoolClient): Promise<Product> {
		const query = `INSERT INTO geohub.product (id, description, expression, label) VALUES ($1, $2, $3, $4)`;
		const values = [
			this.product.id,
			this.product.description,
			this.product.expression,
			this.product.label
		];
		await client.query(query, values);
		return this.product;
	}

	public async update(client: PoolClient): Promise<Product> {
		const query = `UPDATE geohub.product SET description=$2, expression=$3, label=$4 WHERE id=$1`;
		const values = [
			this.product.id,
			this.product.description,
			this.product.expression,
			this.product.label
		];
		await client.query(query, values);
		return this.product;
	}

	public async delete(client: PoolClient): Promise<void> {
		const query = `DELETE FROM geohub.product WHERE id=$1`;
		const values = [this.product.id];
		await client.query(query, values);
	}
}
