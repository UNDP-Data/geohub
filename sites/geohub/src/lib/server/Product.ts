/**
 * To register products in GeoHub using the /api/products endpoint
 * ALLOWED METHODS: GET, POST, PUT, DELETE
 */
import type { Product } from '$lib/types';
import { db } from '$lib/server/db';
import { productInGeohub } from '$lib/server/schema';
import { eq } from 'drizzle-orm';

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

	public async get(): Promise<Product> {
		const products = await db
			.select({
				id: productInGeohub.id,
				description: productInGeohub.description,
				expression: productInGeohub.expression,
				label: productInGeohub.label
			})
			.from(productInGeohub)
			.where(eq(productInGeohub.id, this.product.id));

		return products.length > 0 ? products[0] : (undefined as unknown as Product);
	}

	public async insert(): Promise<Product> {
		await db
			.insert(productInGeohub)
			.values({
				id: this.product.id as string,
				description: this.product.description as string,
				expression: this.product.expression as string,
				label: this.product.label as string
			})
			.returning();

		return this.product;
	}

	public async update(): Promise<Product> {
		await db
			.update(productInGeohub)
			.set({
				description: this.product.description as string,
				expression: this.product.expression as string,
				label: this.product.label as string
			})
			.where(eq(productInGeohub.id, this.product.id));

		return this.product;
	}

	public async delete(): Promise<void> {
		await db.delete(productInGeohub).where(eq(productInGeohub.id, this.product.id));
	}
}
