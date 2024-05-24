"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Tags {
    tags;
    getTags() {
        return this.tags;
    }
    setTags(tags) {
        this.tags = tags;
    }
    constructor(tags) {
        this.tags = tags || [];
    }
    add(tag) {
        const res = this.tags.find((y) => y.value === tag.value && y.key === tag.key);
        if (!res) {
            this.tags.push(tag);
        }
    }
    async insert(client) {
        const masterTags = await this.load(client);
        for (const tag of this.tags) {
            const masterTag = masterTags.find((t) => {
                if (tag.key) {
                    return t.value === tag.value && t.key === tag.key;
                }
                else {
                    return t.value === tag.value && !t.key;
                }
            });
            if (!masterTag) {
                let sql = `INSERT INTO geohub.tag (value) values ($1) returning id`;
                const values = [tag.value];
                if (tag.key) {
                    sql = `INSERT INTO geohub.tag (value, key) values ($1, $2) returning id`;
                    values.push(tag.key);
                }
                const query = {
                    text: sql,
                    values: values
                };
                // console.log(`${query.text}; ${query.values.join(',')}`);
                const res = await client.query(query);
                if (res.rowCount === 0)
                    continue;
                const id = res.rows[0].id;
                tag.id = id;
                masterTags.push(tag);
            }
            else {
                tag.id = masterTag.id;
            }
        }
        return this.tags;
    }
    async load(client) {
        const query = {
            text: `SELECT id, value, key FROM geohub.tag`
        };
        const res = await client.query(query);
        const tags = [];
        if (res.rowCount === 0)
            return tags;
        res.rows.forEach((row) => {
            tags.push({
                id: row.id,
                value: row.value,
                key: row.key
            });
        });
        return tags;
    }
    async cleanup(client) {
        const query = {
            text: `
			DELETE FROM geohub.tag x
			WHERE
			(NOT EXISTS (SELECT tag_id FROM geohub.dataset_tag WHERE tag_id = x.id))
			`
        };
        await client.query(query);
    }
}
exports.default = Tags;
