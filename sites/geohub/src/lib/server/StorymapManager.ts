import type { PoolClient } from 'pg';
import type { StoryMapChapter, StoryMapConfig } from '$lib/types';
import { AccessLevel, Permission } from '$lib/config/AppConfig';
import { StorymapPermissionManager } from './StorymapPermissionManager';
import { v4 as uuidv4 } from 'uuid';
import { getDomainFromEmail } from '$lib/helper';
import { env } from '$env/dynamic/private';

class StorymapManager {
	private storymap: StoryMapConfig;
	public getStorymap() {
		return this.storymap;
	}

	constructor(storymap?: StoryMapConfig) {
		// initialize default values
		if (!storymap) return;
		if (!storymap.id) storymap.id = uuidv4();
		if (!storymap.template_id) storymap.template_id = 'light';
		if (!storymap.chapters) storymap.chapters = [];
		storymap.chapters.forEach((ch) => {
			if (!ch.id) ch.id = uuidv4();
			if (!ch.alignment) ch.alignment = 'center';
			if (ch.hidden === undefined) ch.hidden = false;
			if (ch.mapInteractive === undefined) ch.mapInteractive = false;
			if (!ch.mapNavigationPosition) ch.mapNavigationPosition = 'top-right';
			if (!ch.location) {
				ch.location = {
					center: [0, 0],
					zoom: 0,
					pitch: 0,
					bearing: 0
				};
			} else {
				if (!ch.location.center) ch.location.center = [0, 0];
				if (!ch.location.zoom) ch.location.zoom = 0;
				if (!ch.location.pitch) ch.location.pitch = 0;
				if (!ch.location.bearing) ch.location.bearing = 0;
			}
			if (!ch.mapAnimation) ch.mapAnimation = 'flyTo';
			if (ch.rotateAnimation === undefined) ch.rotateAnimation = false;
			if (ch.spinGlobe === undefined) ch.spinGlobe = false;
		});

		this.storymap = storymap;
	}

	private getSelectSql = (is_superuser: boolean, user_email: string, isCount = false) => {
		return `
		WITH no_stars as (
			SELECT storymap_id, count(*) as no_stars FROM geohub.storymap_favourite GROUP BY storymap_id
		),
		permission as (
			SELECT storymap_id, permission FROM geohub.storymap_permission 
			WHERE user_email='${user_email}'
		)
		SELECT
			${
				isCount
					? 'count(*) as count'
					: `
				a.id, 
			a.title, 
			a.logo,
			a.subtitle, 
			a.byline, 
			a.footer, 
			a.template_id, 
			a.style_id, 
			a.base_style_id, 
			a.access_level, 
			a.createdat, 
			a.created_user, 
			a.updatedat, 
			a.updated_user,
			CASE WHEN z.no_stars is not null THEN cast(z.no_stars as integer) ELSE 0 END as no_stars,
			${
				user_email
					? `
						CASE
							WHEN (
							SELECT count(storymap_id) as count FROM geohub.storymap_favourite 
							WHERE storymap_id=a.id and user_email='${user_email}'
							) > 0 THEN true
							ELSE false
						END as is_star,
						`
					: 'false as is_star,'
			}
            ${
							!is_superuser && user_email
								? `CASE WHEN p.permission is not null THEN p.permission ELSE null END`
								: `${is_superuser ? Permission.OWNER : 'null'}`
						} as permission,
			array_to_json(array_agg(row_to_json((
				SELECT p FROM (
				SELECT
					c.id,
					c.title, 
					c.description,
					c.image,
					c.card_hidden as "cardHidden", 
					c.alignment, 
					c.map_interactive as "mapInteractive", 
					c.map_navigation_position as "mapNavigationPosition",
					c.map_animation as "mapAnimation", 
					c.rotate_animation as "rotateAnimation", 
					c.spinglobe as "spinGlobe", 
					c.hidden, 
					json_build_object(
						'center', ARRAY[ST_X(c.center), ST_Y(c.center)], 
						'zoom', c.zoom, 
						'bearing', c.bearing, 
						'pitch', c.pitch
					) as location,
					c.style_id, 
					c.base_style_id, 
					c.on_chapter_enter as "onChapterEnter", 
					c.on_chapter_exit as "onChapterExit", 
					c.createdat, 
					c.created_user, 
					c.updatedat, 
					c.updated_user
				) AS p
			)))) AS chapters
				`
			}
		FROM geohub.storymap a
		${
			isCount
				? ''
				: `
		LEFT JOIN geohub.storymap_chapters b
		ON a.id = b.storymap_id
		INNER JOIN geohub.storymap_chapter c
		ON b.chapter_id = c.id
			`
		}
		LEFT JOIN no_stars z
		ON a.id = z.storymap_id
		LEFT JOIN permission p
          ON a.id = p.storymap_id
		{where}
		GROUP BY
			a.id, 
			a.title, 
			a.logo, 
			a.subtitle, 
			a.byline, 
			a.footer, 
			a.template_id, 
			a.style_id, 
			a.base_style_id, 
			a.access_level, 
			a.createdat, 
			a.created_user, 
			a.updatedat, 
			a.updated_user,
			no_stars,
			permission
		`;
	};

	private generateStyleUrl = (story: StoryMapConfig) => {
		if (story.style_id) {
			story.style = `/api/style/${story.style_id}.json`;
		} else {
			story.style = `/api/mapstyle/${story.base_style_id ?? 'style'}.json`;
		}
		story.chapters.forEach((ch) => {
			const chapter = ch as unknown as StoryMapChapter;
			if (chapter.style_id) {
				chapter.style = `/api/style/${chapter.style_id}.json`;
			} else if (chapter.base_style_id) {
				chapter.style = `/api/mapstyle/${chapter.base_style_id}.json`;
			} else {
				// if no style specified for chapter, use parent style either style_id or base_style_id
				if (story.style_id) {
					chapter.style = `/api/style/${story.style_id}.json`;
					chapter.style_id = story.style_id;
				} else {
					chapter.style = `/api/mapstyle/${story.base_style_id}.json`;
					chapter.base_style_id = story.base_style_id;
				}
			}
		});
		return story;
	};

	private getWhereSql(
		query: string,
		accessLevel: AccessLevel,
		onlyStar: boolean,
		user_email: string
	) {
		let domain: string;
		if (user_email) {
			domain = getDomainFromEmail(user_email);
		}

		const where = `
    WHERE (

		${accessLevel === AccessLevel.PUBLIC ? `a.access_level = ${AccessLevel.PUBLIC}` : ''}
		${
			accessLevel === AccessLevel.ORGANIZATION
				? `a.access_level = ${AccessLevel.PUBLIC}
			${
				domain
					? `OR (
					a.access_level = ${AccessLevel.ORGANIZATION} AND a.created_user LIKE '%${domain}'
					OR (
						a.access_level = ${AccessLevel.ORGANIZATION} AND a.created_user LIKE '%${domain}'
						AND 
						EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
					)
					)
					`
					: ''
			}
		`
				: ''
		}
		${
			accessLevel === AccessLevel.PRIVATE
				? `
		a.access_level = ${AccessLevel.PUBLIC}
		${
			domain
				? `OR (
					a.access_level = ${AccessLevel.ORGANIZATION} AND a.created_user LIKE '%${domain}'
					OR (
						a.access_level = ${AccessLevel.ORGANIZATION} AND a.created_user LIKE '%${domain}'
						AND 
						EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
					)
				)`
				: ''
		}
		${
			user_email
				? `OR (
					a.created_user = '${user_email}' 
					OR EXISTS (SELECT storymap_id FROM geohub.storymap_permission WHERE storymap_id = a.id AND user_email='${user_email}')
					OR EXISTS (SELECT user_email FROM geohub.superuser WHERE user_email='${user_email}')
				)`
				: ''
		}
		`
				: ''
		}
      
    )
    ${query ? 'AND (to_tsvector(a.title) @@ to_tsquery($1) OR to_tsvector(a.subtitle) @@ to_tsquery($1))' : ''}
	${
		onlyStar && user_email
			? `
			AND EXISTS (
			SELECT storymap_id FROM geohub.storymap_favourite WHERE storymap_id=a.id AND user_email='${user_email}'
			)
			`
			: ''
	}
    `;

		const values: string[] = [];
		if (query) {
			values.push(query);
		}

		return { sql: where, values };
	}

	public async getTotalCount(
		client: PoolClient,
		query: string,
		accessLevel: AccessLevel,
		onlyStar: boolean,
		is_superuser: boolean,
		user_email: string
	) {
		let sql = this.getSelectSql(is_superuser, user_email, true);

		const where = this.getWhereSql(query, accessLevel, onlyStar, user_email);

		sql = sql.replace('{where}', where.sql);

		const res = await client.query({
			text: sql,
			values: where.values
		});
		if (res.rowCount === 0) {
			return 0;
		} else {
			return Number(res.rows[0].count);
		}
	}

	private createLinks = (story: StoryMapConfig) => {
		return [
			{
				rel: 'root',
				type: 'application/json',
				href: `/api/storymaps`
			},
			{
				rel: 'self',
				type: 'application/json',
				href: `/api/storymaps/${story.id}`
			},
			{
				rel: 'storymap',
				type: 'application/json',
				href: `/storymaps/${story.id}`
			},
			{
				rel: 'viewer',
				type: 'application/json',
				href: `/storymaps/${story.id}/viewer`
			},
			{
				rel: 'edit',
				type: 'application/json',
				href: `/storymaps/${story.id}/edit`
			},
			{
				rel: 'static-auto',
				type: 'image/png',
				href: `${env.GEOHUB_STATIC_IMAGE_API}/style/static/auto/{width}x{height}.webp?url=${story.style as string}`
			},
			{
				rel: 'ogimage',
				type: 'image/png',
				href: `${env.GEOHUB_STATIC_IMAGE_API}/og?url=${story.style as string}`
			}
		];
	};

	public async search(
		client: PoolClient,
		query: string,
		limit: number,
		offset: number,
		accessLevel: AccessLevel,
		onlyStar: boolean,
		sortByColumn: string,
		sortOrder: 'asc' | 'desc',
		is_superuser: boolean,
		user_email: string
	) {
		let sql = this.getSelectSql(is_superuser, user_email);

		const where = this.getWhereSql(query, accessLevel, onlyStar, user_email);

		sql = sql.replace('{where}', where.sql);

		sql = `${sql}
		ORDER BY
			${sortByColumn} ${sortOrder} 
		LIMIT ${limit}
		OFFSET ${offset}
		`;
		const res = await client.query({
			text: sql,
			values: where.values
		});
		const stories = res.rows as StoryMapConfig[];
		for (let i = 0; i < stories.length; i++) {
			stories[i] = this.generateStyleUrl(stories[i]);
			stories[i].links = this.createLinks(stories[i]);
		}
		return stories;
	}

	public async getById(client: PoolClient, id: string, is_superuser: boolean, user_email?: string) {
		let sql = this.getSelectSql(is_superuser, user_email);
		const where = `
		WHERE
			a.id = $1
		`;
		sql = sql.replace('{where}', where);

		const query = {
			text: sql,
			values: [id]
		};
		const res = await client.query(query);

		if (res.rowCount === 0) {
			return undefined;
		}
		let story = res.rows[0] as StoryMapConfig;
		story = this.generateStyleUrl(story);
		story.links = this.createLinks(story);
		return story;
	}

	public async upsert(client: PoolClient) {
		console.debug(`started upserting ${this.storymap.id}`);

		// delete existing chapters
		let queryDelete = {
			text: `DELETE FROM geohub.storymap_chapter
			USING geohub.storymap_chapters
			WHERE geohub.storymap_chapter.id = geohub.storymap_chapters.chapter_id
			AND geohub.storymap_chapters.storymap_id = $1`,
			values: [this.storymap.id]
		};
		await client.query(queryDelete);
		queryDelete = {
			text: `DELETE FROM geohub.storymap_chapters WHERE storymap_id = $1`,
			values: [this.storymap.id]
		};
		await client.query(queryDelete);

		// insert chapters
		for (const ch of this.storymap.chapters) {
			const chapter = ch as unknown as StoryMapChapter;
			// console.log(JSON.stringify(chapter, null, 4));

			const queryChapter = {
				text: `
				INSERT INTO geohub.storymap_chapter (
				id, 
				title, 
				description, 
				image, 
				card_hidden, 
				alignment, 
				map_interactive, 
				map_navigation_position, 
				map_animation, 
				rotate_animation, 
				spinglobe, 
				hidden, 
				center, 
				zoom, 
				bearing, 
				pitch, 
				style_id, 
				base_style_id, 
				on_chapter_enter, 
				on_chapter_exit, 
				createdat, 
				created_user, 
				updatedat, 
				updated_user
			) VALUES (
				$1, $2, $3, $4, $5, $6, 
				$7, $8, $9, $10, $11, $12, 
				ST_GeomFromText('POINT(${chapter.location.center.join(' ')})', 4326), 
				$13, $14, $15, $16, $17, $18, 
				$19, $20, $21, $22, $23
			)
				`,
				values: [
					chapter.id,
					chapter.title,
					chapter.description,
					chapter.image,
					chapter.cardHidden ?? false,
					chapter.alignment,
					chapter.mapInteractive,
					chapter.mapNavigationPosition,
					chapter.mapAnimation,
					chapter.rotateAnimation,
					chapter.spinGlobe,
					chapter.hidden,
					chapter.location.zoom,
					chapter.location.bearing,
					chapter.location.pitch,
					chapter.style_id,
					chapter.base_style_id,
					chapter.onChapterEnter ? JSON.stringify(chapter.onChapterEnter) : undefined,
					chapter.onChapterExit ? JSON.stringify(chapter.onChapterExit) : undefined,
					chapter.createdat,
					chapter.created_user,
					chapter.updatedat,
					chapter.updated_user
				]
			};
			await client.query(queryChapter);
			console.debug(`inserted ${chapter.id} into storymap_chapter table`);
		}

		// insert storymap
		const queryStorymap = {
			text: `
			INSERT INTO geohub.storymap (
			  id, 
			  title, 
			  logo, 
			  subtitle, 
			  byline, 
			  footer, 
			  template_id, 
			  style_id, 
			  base_style_id,
			  access_level,
			  createdat, 
			  created_user
			) 
			values (
			  $1, 
			  $2, 
			  $3, 
			  $4, 
			  $5, 
			  $6, 
			  $7,
			  $8,
			  $9,
			  $10,
			  $11, 
			  $12
			) 
			ON CONFLICT (id)
			DO
			UPDATE
			 SET
			  title=$2, 
			  logo=$3, 
			  subtitle=$4, 
			  byline=$5, 
			  footer=$6, 
			  template_id=$7, 
			  style_id=$8,
			  base_style_id=$9,
			  access_level=$10,
			  updatedat=$13,
			  updated_user=$14`,
			values: [
				this.storymap.id,
				this.storymap.title,
				this.storymap.logo,
				this.storymap.subtitle,
				this.storymap.byline,
				this.storymap.footer,
				this.storymap.template_id,
				this.storymap.style_id,
				this.storymap.base_style_id,
				this.storymap.access_level,
				this.storymap.createdat,
				this.storymap.created_user,
				this.storymap.updatedat,
				this.storymap.updated_user
			]
		};
		await client.query(queryStorymap);
		console.debug(`updated storymap table`);

		for (const ch of this.storymap.chapters) {
			// insert storymap_chapters
			const sequence = this.storymap.chapters.indexOf(ch) + 1;
			const queryChapters = {
				text: `INSERT INTO geohub.storymap_chapters 
				(storymap_id, chapter_id, sequence) 
				VALUES ($1, $2, $3)`,
				values: [this.storymap.id, ch.id, sequence]
			};
			await client.query(queryChapters);
		}
		console.debug(`updated storymap_chapters table`);

		// if it is new data (no permission settings in the table yet), insert user email address as an owner of the dataset.
		const dpm = new StorymapPermissionManager(this.storymap.id, this.storymap.created_user);
		const permissions = await dpm.getAll(client);
		if (permissions.length === 0) {
			await dpm.register(client, {
				storymap_id: this.storymap.id,
				user_email: this.storymap.created_user,
				permission: Permission.OWNER
			});
			console.debug(`added ${this.storymap.created_user} as an owner of the dataset`);
		}
		console.debug(`ended upserting ${this.storymap.id}`);
		return this.storymap;
	}

	public async delete(client: PoolClient, storymapId: string) {
		console.debug(`started deleting ${storymapId}`);

		const queryChapters = {
			text: `
			DELETE FROM geohub.storymap_chapter
			USING geohub.storymap_chapters
			WHERE geohub.storymap_chapters.chapter_id = geohub.storymap_chapter.id
			AND geohub.storymap_chapters.storymap_id = $1
			`,
			values: [storymapId]
		};
		await client.query(queryChapters);

		const queryStorymap = {
			text: `DELETE FROM geohub.storymap WHERE id = $1`,
			values: [storymapId]
		};
		await client.query(queryStorymap);
		console.debug(`ended deleting ${storymapId}`);
	}
}

export default StorymapManager;
