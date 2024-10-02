import type { Tag } from '$lib/types';
import { sql } from 'drizzle-orm';
import { datasetTagInGeohub, tagInGeohub } from '$lib/server/schema';
import { db, type TransactionSchema } from '$lib/server/db';

class TagManager {
	private tags: Tag[];
	public getTags() {
		return this.tags;
	}
	public setTags(tags: Tag[]) {
		this.tags = tags;
	}

	constructor(tags?: Tag[]) {
		this.tags = tags || [];
	}

	public add(tag: Tag) {
		const res = this.tags.find((y) => y.value === tag.value && y.key === tag.key);
		if (!res) {
			this.tags.push(tag);
		}
	}

	public async insert(tx?: TransactionSchema) {
		const masterTags = await this.load(tx);

		for (const tag of this.tags) {
			const masterTag = masterTags.find((t) => {
				if (tag.key) {
					return t.value === tag.value && t.key === tag.key;
				} else {
					return t.value === tag.value && !t.key;
				}
			});
			if (!masterTag) {
				const inserted = await (tx ?? db)
					.insert(tagInGeohub)
					.values({
						value: tag.value as string,
						key: tag.key
					})
					.returning({ id: tagInGeohub.id });
				if (inserted.length === 0) continue;
				const id = inserted[0].id;
				tag.id = `${id}`;
			} else {
				tag.id = masterTag.id;
			}
		}
		return this.tags;
	}

	private async load(tx?: TransactionSchema): Promise<Tag[]> {
		const tags: Tag[] = (await (tx ?? db)
			.select({
				id: tagInGeohub.id,
				key: tagInGeohub.key,
				value: tagInGeohub.value
			})
			.from(tagInGeohub)) as unknown as Tag[];
		return tags;
	}

	public async cleanup(tx?: TransactionSchema) {
		await (tx ?? db).execute(sql`
		DELETE FROM ${tagInGeohub}
		WHERE
		(NOT EXISTS (SELECT ${datasetTagInGeohub.tagId} FROM ${datasetTagInGeohub} WHERE ${datasetTagInGeohub.tagId} = ${tagInGeohub.id}))	
		`);
	}
}

export default TagManager;
